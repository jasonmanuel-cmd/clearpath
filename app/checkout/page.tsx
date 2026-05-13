'use client'
import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PLANS } from '@/lib/square/client'
import Link from 'next/link'

declare global {
  interface Window {
    Square?: {
      payments: (appId: string, locationId: string) => Promise<{
        card: () => Promise<{
          attach: (selector: string) => Promise<void>
          tokenize: () => Promise<{ status: string; token?: string; errors?: { message: string }[] }>
        }>
      }>
    }
  }
}

function CheckoutInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const planKey = (searchParams.get('plan') ?? 'pro') as keyof typeof PLANS
  const plan = PLANS[planKey] ?? PLANS.pro

  const [loading, setLoading] = useState(false)
  const [sdkReady, setSdkReady] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [cardInstance, setCardInstance] = useState<Awaited<ReturnType<Awaited<ReturnType<NonNullable<typeof window.Square>['payments']>>['card']>> | null>(null)

  useEffect(() => {
    const script = document.createElement('script')
    const env = process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT === 'production'
      ? 'https://web.squarecdn.com/v1/square.js'
      : 'https://sandbox.web.squarecdn.com/v1/square.js'
    script.src = env
    script.onload = async () => {
      if (!window.Square) return
      try {
        const payments = await window.Square.payments(
          process.env.NEXT_PUBLIC_SQUARE_APP_ID!,
          process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID!
        )
        const card = await payments.card()
        await card.attach('#card-container')
        setCardInstance(card)
        setSdkReady(true)
      } catch (e) {
        setError('Failed to load payment form. Please refresh.')
        console.error(e)
      }
    }
    document.body.appendChild(script)
    return () => { document.body.removeChild(script) }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!cardInstance) return
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const result = await cardInstance.tokenize()
    if (result.status !== 'OK' || !result.token) {
      setError(result.errors?.[0]?.message ?? 'Card tokenization failed.')
      setLoading(false)
      return
    }

    const res = await fetch('/api/square/create-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planKey, sourceId: result.token, userId: user.id, email: user.email }),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? 'Payment failed. Please try again.')
      setLoading(false)
      return
    }

    setSuccess(true)
    setTimeout(() => router.push('/dashboard'), 2000)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">✓</div>
          <h1 className="text-3xl font-bold mb-2 text-green-400">You're on {plan.name}!</h1>
          <p className="text-slate-400">Redirecting to your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <Link href="/" className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center font-bold text-sm text-black">EX</div>
          <span className="font-semibold text-lg">Expunge</span>
        </Link>

        <div className="bg-slate-900 border border-white/10 rounded-2xl p-8">
          {/* Plan summary */}
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/10">
            <div>
              <div className="font-semibold text-lg">{plan.name} Plan</div>
              <div className="text-slate-400 text-sm">{plan.description}</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-400">{plan.priceLabel}</div>
              <div className="text-slate-500 text-xs">billed monthly</div>
            </div>
          </div>

          {/* Features recap */}
          <ul className="space-y-2 mb-6">
            {plan.features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                <span className="text-green-400">✓</span> {f}
              </li>
            ))}
          </ul>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label className="block text-sm text-slate-300 mb-2">Card details</label>
              <div
                id="card-container"
                className="bg-slate-800 border border-white/10 rounded-xl p-4 min-h-[56px]"
                style={{ colorScheme: 'dark' }}
              />
              {!sdkReady && (
                <div className="text-xs text-slate-500 mt-2 text-center">Loading secure payment form...</div>
              )}
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4 mb-5 text-xs text-slate-400 flex items-start gap-2">
              <span className="text-green-400 mt-0.5">🔒</span>
              <span>Payments processed securely by Square. Your card details never touch our servers.</span>
            </div>

            <button
              type="submit"
              disabled={loading || !sdkReady}
              className="w-full bg-green-500 hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-4 rounded-xl transition text-lg"
            >
              {loading ? 'Processing...' : `Subscribe — ${plan.priceLabel}`}
            </button>

            <p className="text-center text-slate-500 text-xs mt-4">
              Cancel anytime from billing settings.{' '}
              <Link href="/pricing" className="underline hover:text-slate-400">Compare plans</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CheckoutInner />
    </Suspense>
  )
}
