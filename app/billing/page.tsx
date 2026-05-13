import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PLANS } from '@/lib/square/client'
import CancelButton from './cancel-button'

export default async function BillingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const plan = (sub?.plan ?? 'free') as keyof typeof PLANS
  const planInfo = PLANS[plan]
  const status = sub?.status ?? 'active'
  const periodEnd = sub?.current_period_end
    ? new Date(sub.current_period_end).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : null

  const STATUS_COLORS: Record<string, string> = {
    active: 'text-green-400',
    trialing: 'text-blue-400',
    past_due: 'text-red-400',
    canceled: 'text-slate-400',
    paused: 'text-yellow-400',
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 px-8 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center font-bold text-sm text-black">EX</div>
          <span className="font-semibold">Expunge</span>
        </Link>
        <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white transition">← Dashboard</Link>
      </header>

      <div className="max-w-2xl mx-auto px-8 py-12">
        <h1 className="text-2xl font-bold mb-8">Billing & Subscription</h1>

        {/* Current plan */}
        <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Current Plan</div>
              <div className="text-2xl font-bold">{planInfo.name}</div>
              <div className="text-slate-400 text-sm mt-0.5">{planInfo.priceLabel}</div>
            </div>
            <span className={`text-sm font-medium capitalize ${STATUS_COLORS[status] ?? 'text-slate-400'}`}>
              {status.replace('_', ' ')}
            </span>
          </div>

          {periodEnd && status === 'active' && (
            <div className="text-sm text-slate-400">
              {sub?.cancel_at_period_end ? `Cancels on ${periodEnd}` : `Renews on ${periodEnd}`}
            </div>
          )}

          <ul className="mt-4 space-y-1.5">
            {planInfo.features.map((f) => (
              <li key={f} className="text-sm text-slate-300 flex items-center gap-2">
                <span className="text-green-400">✓</span> {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {plan !== 'pro' && plan !== 'partner' && (
            <Link
              href="/pricing"
              className="block w-full text-center bg-green-500 hover:bg-green-400 text-black font-bold py-3.5 rounded-xl transition"
            >
              Upgrade plan
            </Link>
          )}
          {plan === 'basic' && (
            <Link
              href="/checkout?plan=pro"
              className="block w-full text-center bg-white/10 hover:bg-white/20 font-medium py-3.5 rounded-xl transition"
            >
              Upgrade to Pro — $99/mo
            </Link>
          )}

          {status === 'active' && plan !== 'free' && !sub?.cancel_at_period_end && (
            <CancelButton />
          )}
        </div>

        <div className="mt-8 text-xs text-slate-600 text-center">
          Questions? Contact us at <span className="text-slate-500">support@expunge.ai</span>
        </div>
      </div>
    </div>
  )
}
