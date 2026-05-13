import { NextRequest, NextResponse } from 'next/server'
import { squareClient } from '@/lib/square/client'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const service = createServiceClient()
    const { data: sub } = await service
      .from('subscriptions')
      .select('square_subscription_id')
      .eq('user_id', user.id)
      .single()

    if (!sub?.square_subscription_id) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 })
    }

    await squareClient.subscriptions.cancel(sub.square_subscription_id)

    await service
      .from('subscriptions')
      .update({ status: 'canceled', cancel_at_period_end: true, plan: 'free' })
      .eq('user_id', user.id)

    return NextResponse.json({ success: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Cancellation failed'
    console.error('Cancel subscription error:', err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
