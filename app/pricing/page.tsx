import Link from 'next/link'
import { PLANS } from '@/lib/square/client'
import { createClient } from '@/lib/supabase/server'

const CHECK = (
  <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

export default async function PricingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let currentPlan = 'free'
  if (user) {
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('plan')
      .eq('user_id', user.id)
      .single()
    currentPlan = sub?.plan ?? 'free'
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center font-bold text-sm text-black">EX</div>
          <span className="font-semibold tracking-tight">Expunge</span>
        </Link>
        <div className="flex items-center gap-4">
          {user ? (
            <Link href="/dashboard" className="text-sm text-slate-300 hover:text-white transition">Dashboard</Link>
          ) : (
            <>
              <Link href="/login" className="text-sm text-slate-300 hover:text-white transition">Sign in</Link>
              <Link href="/register" className="text-sm bg-green-500 hover:bg-green-400 transition px-4 py-2 rounded-lg font-medium text-black">Get started</Link>
            </>
          )}
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-20">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-1.5 text-sm text-green-400 mb-6">
            Simple, transparent pricing
          </div>
          <h1 className="text-5xl font-bold mb-4">Disputes done. Records erased.</h1>
          <p className="text-slate-400 text-xl max-w-2xl mx-auto">
            Start free. Upgrade when you need the full arsenal.
          </p>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {(Object.entries(PLANS) as [string, typeof PLANS[keyof typeof PLANS]][]).map(([key, plan]) => {
            const isCurrent = currentPlan === key
            const isHighlighted = plan.highlighted

            return (
              <div
                key={key}
                className={`relative rounded-2xl border p-6 flex flex-col ${
                  isHighlighted
                    ? 'bg-green-500/5 border-green-500/40'
                    : 'bg-slate-900 border-white/10'
                }`}
              >
                {isHighlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                    MOST POPULAR
                  </div>
                )}

                <div className="mb-6">
                  <div className="text-sm font-medium text-slate-400 mb-1">{plan.name}</div>
                  <div className="text-4xl font-bold mb-1">{plan.priceLabel}</div>
                  <div className="text-slate-500 text-sm">{plan.description}</div>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                      {CHECK}
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <div className="w-full text-center py-3 rounded-xl text-sm font-medium border border-white/20 text-slate-400">
                    Current plan
                  </div>
                ) : key === 'free' ? (
                  <Link
                    href={user ? '/dashboard' : '/register'}
                    className="w-full text-center py-3 rounded-xl text-sm font-medium border border-white/20 text-slate-300 hover:text-white hover:border-white/40 transition block"
                  >
                    {plan.cta}
                  </Link>
                ) : (
                  <Link
                    href={user ? `/checkout?plan=${key}` : `/register?redirect=/checkout?plan=${key}`}
                    className={`w-full text-center py-3 rounded-xl text-sm font-bold transition block ${
                      isHighlighted
                        ? 'bg-green-500 hover:bg-green-400 text-black'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                )}
              </div>
            )
          })}
        </div>

        {/* FAQ strip */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-white/10 pt-16">
          {[
            { q: 'Can I cancel anytime?', a: 'Yes. Cancel from your billing page with one click. Your plan stays active until the end of the billing period.' },
            { q: 'What payment methods?', a: 'All major credit and debit cards via Square — Visa, Mastercard, Amex, Discover. Secure, encrypted.' },
            { q: 'Do letters really work?', a: 'Our AI applies 30 years of FCRA case law and real-world outcome data to every letter. Results vary by case but we optimize every dispute.' },
          ].map(({ q, a }) => (
            <div key={q}>
              <div className="font-semibold mb-2">{q}</div>
              <div className="text-slate-400 text-sm leading-relaxed">{a}</div>
            </div>
          ))}
        </div>

        {/* Legal footer */}
        <div className="mt-12 text-center text-slate-600 text-xs">
          By subscribing you agree to our{' '}
          <Link href="/terms" className="text-slate-500 hover:text-slate-400 underline">Terms of Service</Link>
          {' '}and{' '}
          <Link href="/privacy" className="text-slate-500 hover:text-slate-400 underline">Privacy Policy</Link>.
          Expunge is not a law firm and does not provide legal advice.
        </div>
      </div>
    </div>
  )
}
