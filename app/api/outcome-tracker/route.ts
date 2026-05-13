import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { processOutcome } from '@/lib/agents/learning-agent'
import type { DisputeType, Bureau, OutcomeResult } from '@/lib/types'

export async function POST(req: NextRequest) {
  try {
    const { dispatchRecordId, result, scoreImpactPoints, notes } = await req.json()
    const supabase = createServiceClient()

    const { data: dispatch } = await supabase
      .from('dispatch_records')
      .select('*, letters(dispute_item_id, content)')
      .eq('id', dispatchRecordId)
      .single()

    if (!dispatch) {
      return NextResponse.json({ error: 'Dispatch record not found' }, { status: 404 })
    }

    await supabase
      .from('dispatch_records')
      .update({ status: 'response_received', response_received_at: new Date().toISOString() })
      .eq('id', dispatchRecordId)

    await supabase.from('outcomes').insert({
      dispatch_record_id: dispatchRecordId,
      result,
      score_impact_points: scoreImpactPoints,
      notes,
    })

    const statusMap: Record<string, string> = {
      removed: 'removed',
      modified: 'modified',
      verified: 'verified',
      no_response: 'no_response',
    }

    if (dispatch.letters?.dispute_item_id) {
      await supabase
        .from('dispute_items')
        .update({ status: statusMap[result] || 'received' })
        .eq('id', dispatch.letters.dispute_item_id)
    }

    // Pull full dispute context for learning agent
    const { data: disputeItem } = await supabase
      .from('dispute_items')
      .select('type, legal_basis, round, account_name, amount, dispute_reason, specialist_output')
      .eq('id', dispatch.letters?.dispute_item_id)
      .single()

    if (disputeItem) {
      const sentAt = new Date(dispatch.sent_at)
      const now = new Date()
      const daysToResponse = Math.floor((now.getTime() - sentAt.getTime()) / (1000 * 60 * 60 * 24))

      // Record to legacy intelligence table
      await supabase.from('intelligence_records').insert({
        dispute_type: disputeItem.type,
        bureau: dispatch.bureau,
        legal_basis: disputeItem.legal_basis,
        round: disputeItem.round,
        result,
        days_to_response: daysToResponse,
      })

      // Feed outcome back to orchestrator learning agent (non-blocking)
      const specialistOutput = disputeItem.specialist_output as {
        strategy?: string; letterTone?: string
      } | null

      processOutcome({
        disputeType: disputeItem.type as DisputeType,
        bureau: dispatch.bureau as Bureau,
        legalBasisUsed: disputeItem.legal_basis ?? 'FCRA §611',
        strategySummary: specialistOutput?.strategy ?? disputeItem.dispute_reason ?? '',
        letterTone: specialistOutput?.letterTone ?? 'firm',
        letterContent: dispatch.letters?.content ?? '',
        outcome: result as OutcomeResult,
        daysToResponse,
        round: disputeItem.round ?? 1,
        accountName: disputeItem.account_name,
        amount: disputeItem.amount,
      }).catch((err) => console.error('Learning agent error (non-fatal):', err))
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Outcome tracker error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET: Check for expired 30-day windows and mark as no_response
export async function GET() {
  try {
    const supabase = createServiceClient()
    const now = new Date().toISOString()

    const { data: expired } = await supabase
      .from('dispatch_records')
      .select('id')
      .eq('status', 'sent')
      .lt('response_due_at', now)

    if (expired && expired.length > 0) {
      const ids = expired.map((r: { id: string }) => r.id)
      await supabase
        .from('dispatch_records')
        .update({ status: 'no_response' })
        .in('id', ids)

      await supabase.from('outcomes').insert(
        ids.map((id: string) => ({ dispatch_record_id: id, result: 'no_response' }))
      )

      // Feed no_response outcomes to learning agent
      const { data: expiredRecords } = await supabase
        .from('dispatch_records')
        .select(`
          id, bureau, sent_at,
          letters(content, dispute_items(type, legal_basis, round, account_name, amount, specialist_output))
        `)
        .in('id', ids)

      for (const record of expiredRecords ?? []) {
        const letter = Array.isArray(record.letters) ? record.letters[0] : record.letters
        const item = letter && (Array.isArray(letter.dispute_items) ? letter.dispute_items[0] : letter.dispute_items)
        if (!item) continue

        const sentAt = new Date(record.sent_at)
        const daysElapsed = Math.floor((Date.now() - sentAt.getTime()) / (1000 * 60 * 60 * 24))
        const specialistOutput = item.specialist_output as { strategy?: string; letterTone?: string } | null

        processOutcome({
          disputeType: item.type as DisputeType,
          bureau: record.bureau as Bureau,
          legalBasisUsed: item.legal_basis ?? 'FCRA §611',
          strategySummary: specialistOutput?.strategy ?? '',
          letterTone: specialistOutput?.letterTone ?? 'firm',
          letterContent: letter.content ?? '',
          outcome: 'no_response',
          daysToResponse: daysElapsed,
          round: item.round ?? 1,
          accountName: item.account_name,
          amount: item.amount,
        }).catch((err) => console.error('Learning agent (no_response) error:', err))
      }
    }

    return NextResponse.json({ checked: expired?.length ?? 0 })
  } catch (err) {
    console.error('Outcome tracker check error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
