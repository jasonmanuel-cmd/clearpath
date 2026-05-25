import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { runEscalationBot } from '@/lib/agents/escalation-bot'
import type { OrchestratorItem } from '@/lib/types'

export async function POST(req: NextRequest) {
  try {
    // Verify authenticated user
    const authClient = await createClient()
    const { data: { user } } = await authClient.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { disputeItemId } = await req.json()
    const supabase = createServiceClient()

    const { data: item } = await supabase
      .from('dispute_items')
      .select('*, cases(user_id, profiles(full_name))')
      .eq('id', disputeItemId)
      .single()

    if (!item) {
      return NextResponse.json({ error: 'Dispute item not found' }, { status: 404 })
    }

    // Verify the case belongs to the authenticated user
    if (item.cases?.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: dispatch } = await supabase
      .from('dispatch_records')
      .select('*')
      .eq('status', 'no_response')
      .order('created_at', { ascending: true })
      .limit(1)
      .single()

    const orchestratorItem: OrchestratorItem = {
      type: item.type,
      accountName: item.account_name,
      accountNumber: item.account_number,
      bureau: item.bureau,
      amount: item.amount,
      disputeReason: item.dispute_reason,
      legalBasis: item.legal_basis,
      priority: 10,
    }

    const consumerName = item.cases?.profiles?.full_name || 'Consumer'
    const originalDate = dispatch?.sent_at
      ? new Date(dispatch.sent_at).toLocaleDateString()
      : 'Unknown'
    const newRound = (item.round || 1) + 1

    const { round2Letter, cfpbComplaint } = await runEscalationBot(
      orchestratorItem,
      consumerName,
      originalDate,
      'No response received within 30-day window',
      newRound
    )

    await supabase
      .from('dispute_items')
      .update({ round: newRound, status: 'dispatched' })
      .eq('id', disputeItemId)

    const { data: r2Letter } = await supabase
      .from('letters')
      .insert({ dispute_item_id: disputeItemId, bureau: item.bureau, content: round2Letter, round: newRound })
      .select()
      .single()

    const { data: cfpbLetter } = await supabase
      .from('letters')
      .insert({ dispute_item_id: disputeItemId, bureau: item.bureau, content: cfpbComplaint, round: newRound, is_cfpb_complaint: true })
      .select()
      .single()

    if (r2Letter) {
      const sentAt = new Date()
      const responseDueAt = new Date(sentAt)
      responseDueAt.setDate(responseDueAt.getDate() + 30)
      await supabase.from('dispatch_records').insert({
        letter_id: r2Letter.id,
        bureau: item.bureau,
        tracking_number: `CP-ESC-${Date.now()}`,
        status: 'sent',
        sent_at: sentAt.toISOString(),
        response_due_at: responseDueAt.toISOString(),
      })
    }

    await supabase.from('cases').update({ status: 'escalated' }).eq('id', item.case_id)

    return NextResponse.json({ success: true, round: newRound })
  } catch (err) {
    console.error('Escalation error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
