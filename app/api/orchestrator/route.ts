import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { runOrchestrator } from '@/lib/agents/orchestrator'
import { routeCases } from '@/lib/agents/case-router'
import { runSpecialistAgent } from '@/lib/agents/specialists'
import { generateLetter } from '@/lib/agents/letter-bot'
import type { Bureau } from '@/lib/types'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { caseId, userId: bodyUserId } = body

    if (!caseId) {
      return NextResponse.json({ error: 'caseId is required' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Fetch the case and verify ownership
    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .select('*, profiles(full_name, email)')
      .eq('id', caseId)
      .single()

    if (caseError || !caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    // If bodyUserId provided, verify it matches the case owner
    if (bodyUserId && bodyUserId !== caseData.user_id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (!caseData.credit_report_text) {
      return NextResponse.json({ error: 'No credit report text found' }, { status: 400 })
    }

    await supabase.from('cases').update({ status: 'analyzing' }).eq('id', caseId)

    // Step 1: Master Orchestrator
    const orchestratorOutput = await runOrchestrator(caseData.credit_report_text)
    await supabase
      .from('cases')
      .update({ orchestrator_output: orchestratorOutput, status: 'routing' })
      .eq('id', caseId)

    // Step 2: Case Router
    const routedItems = await routeCases(orchestratorOutput.items)

    // Step 3: Insert dispute items
    const disputeItemsToInsert = orchestratorOutput.items.map((item) => ({
      case_id: caseId,
      type: item.type,
      account_name: item.accountName,
      account_number: item.accountNumber,
      bureau: item.bureau,
      amount: item.amount,
      dispute_reason: item.disputeReason,
      legal_basis: item.legalBasis,
      status: 'pending',
      round: 1,
    }))

    const { data: insertedItems } = await supabase
      .from('dispute_items')
      .insert(disputeItemsToInsert)
      .select()

    await supabase.from('cases').update({ status: 'active' }).eq('id', caseId)

    if (!insertedItems) {
      return NextResponse.json({ error: 'Failed to insert dispute items' }, { status: 500 })
    }

    const consumerName = caseData.profiles?.full_name || 'Consumer'
    const consumer = {
      name: consumerName,
      // TODO: Collect real consumer data (address, SSN last 4, DOB) in upload flow
      // Currently using placeholders — letters will need these filled in before mailing
      address: '[Your Address]',
      ssn_last4: '[SSN Last 4]',
      dob: '[Date of Birth]',
    }

    // Step 4: Run specialist agents + generate letters (sorted by processing order)
    const sortedRouted = [...routedItems].sort((a, b) => a.processingOrder - b.processingOrder)

    for (const routed of sortedRouted) {
      const item = orchestratorOutput.items[routed.itemIndex]
      const dbItem = insertedItems[routed.itemIndex]
      if (!dbItem) continue

      const specialistOutput = await runSpecialistAgent(item, consumerName)
      await supabase
        .from('dispute_items')
        .update({ specialist_output: specialistOutput, status: 'letter_drafted' })
        .eq('id', dbItem.id)

      const bureaus: Bureau[] =
        item.bureau === 'all'
          ? ['equifax', 'experian', 'transunion']
          : [item.bureau as Bureau]

      for (const bureau of bureaus) {
        const letterContent = await generateLetter(item, specialistOutput, consumer, bureau, 1)

        const { data: letter } = await supabase
          .from('letters')
          .insert({ dispute_item_id: dbItem.id, bureau, content: letterContent, round: 1 })
          .select()
          .single()

        if (letter) {
          const sentAt = new Date()
          const responseDueAt = new Date(sentAt)
          responseDueAt.setDate(responseDueAt.getDate() + 30)

          await supabase.from('dispatch_records').insert({
            letter_id: letter.id,
            bureau,
            tracking_number: `CP-${Date.now()}-${bureau.slice(0, 3).toUpperCase()}`,
            status: 'sent',
            sent_at: sentAt.toISOString(),
            response_due_at: responseDueAt.toISOString(),
          })
        }
      }

      await supabase
        .from('dispute_items')
        .update({ status: 'dispatched' })
        .eq('id', dbItem.id)
    }

    await supabase.from('cases').update({ status: 'monitoring' }).eq('id', caseId)

    return NextResponse.json({ success: true, itemCount: orchestratorOutput.totalDisputableItems })
  } catch (err) {
    console.error('Orchestrator error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
