import { NextRequest, NextResponse } from 'next/server'
import { squareClient, LOCATION_ID, PLAN_IDS, PlanKey } from '@/lib/square/client'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { planKey, sourceId, userId, email } = await req.json() as {
      planKey: PlanKey; sourceId: string; userId: string; email: string
    }

    if (!PLAN_IDS[planKey]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Check if Square customer already exists for this user
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('square_customer_id, square_subscription_id')
      .eq('user_id', userId)
      .single()

    let customerId = existingSub?.square_customer_id

    // Create Square customer if new
    if (!customerId) {
      const custResult = await squareClient.customers.create({
        emailAddress: email,
        referenceId: userId,
        note: 'Expunge user',
      })
      customerId = custResult.customer?.id
      if (!customerId) throw new Error('Failed to create Square customer')
    }

    // If already has active subscription, cancel it first (plan change)
    if (existingSub?.square_subscription_id) {
      await squareClient.subscriptions.cancel(existingSub.square_subscription_id)
    }

    // Create card on file
    const cardResult = await squareClient.cards.create({
      idempotencyKey: `${userId}-${Date.now()}`,
      sourceId,
      card: { customerId },
    })
    const cardId = cardResult.card?.id
    if (!cardId) throw new Error('Failed to store card')

    // Create subscription
    const startDate = new Date()
    const subResult = await squareClient.subscriptions.create({
      idempotencyKey: `sub-${userId}-${planKey}-${Date.now()}`,
      locationId: LOCATION_ID,
      planVariationId: PLAN_IDS[planKey],
      customerId,
      cardId,
      startDate: startDate.toISOString().split('T')[0],
    })

    const squareSubId = subResult.subscription?.id
    if (!squareSubId) throw new Error('Failed to create subscription')

    // Persist to Supabase
    await supabase.from('subscriptions').upsert({
      user_id: userId,
      plan: planKey,
      status: 'active',
      square_customer_id: customerId,
      square_subscription_id: squareSubId,
      square_card_id: cardId,
      current_period_start: startDate.toISOString(),
      current_period_end: new Date(startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate()).toISOString(),
    }, { onConflict: 'user_id' })

    return NextResponse.json({ success: true, plan: planKey })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Subscription creation failed'
    console.error('Square create-subscription error:', err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
