import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { createServiceClient } from '@/lib/supabase/server'

// Square sends webhook events — we verify signature then update subscription state
export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get('x-square-hmacsha256-signature') ?? ''
    const sigKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY!
    const url = `${process.env.NEXT_PUBLIC_APP_URL}/api/square/webhook`

    // Verify Square HMAC-SHA256 signature (Square docs: HMAC of url+body, base64 encoded)
    const expected = createHmac('sha256', sigKey).update(url + body).digest('base64')
    const sigBuf = Buffer.from(signature)
    const expBuf = Buffer.from(expected)
    const isValid = sigBuf.length === expBuf.length && timingSafeEqual(sigBuf, expBuf)
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const event = JSON.parse(body)
    const supabase = createServiceClient()

    const subData = event.data?.object?.subscription
    const squareSubId: string | undefined = subData?.id

    if (!squareSubId) return NextResponse.json({ received: true })

    // Map Square subscription statuses to our schema
    const statusMap: Record<string, string> = {
      ACTIVE:        'active',
      CANCELED:      'canceled',
      DEACTIVATED:   'canceled',
      PAUSED:        'paused',
      PENDING:       'trialing',
    }

    const squareStatus: string = subData?.status ?? 'ACTIVE'
    const ourStatus = statusMap[squareStatus] ?? 'active'

    switch (event.type) {
      case 'subscription.created':
      case 'subscription.updated': {
        await supabase
          .from('subscriptions')
          .update({
            status: ourStatus,
            current_period_start: subData?.charged_through_date
              ? new Date(subData.charged_through_date).toISOString()
              : undefined,
          })
          .eq('square_subscription_id', squareSubId)
        break
      }

      case 'subscription.canceled':
      case 'subscription.deactivated': {
        await supabase
          .from('subscriptions')
          .update({ status: 'canceled', cancel_at_period_end: true })
          .eq('square_subscription_id', squareSubId)
        break
      }

      case 'invoice.payment_failed': {
        await supabase
          .from('subscriptions')
          .update({ status: 'past_due' })
          .eq('square_subscription_id', squareSubId)
        break
      }

      case 'invoice.payment_made': {
        const periodEnd = subData?.charged_through_date
          ? new Date(subData.charged_through_date)
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

        await supabase
          .from('subscriptions')
          .update({
            status: 'active',
            current_period_end: periodEnd.toISOString(),
          })
          .eq('square_subscription_id', squareSubId)
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Square webhook error:', err)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
