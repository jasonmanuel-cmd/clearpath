import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex flex-col text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center font-bold text-sm text-black">EX</div>
          <span className="font-semibold text-lg tracking-tight">Expunge</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/pricing" className="text-sm text-slate-400 hover:text-white transition">Pricing</Link>
          <Link href="/login" className="text-sm text-slate-300 hover:text-white transition">Sign in</Link>
          <Link href="/register" className="text-sm bg-green-500 hover:bg-green-400 text-black transition px-4 py-2 rounded-lg font-semibold">
            Get started free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 rounded-full px-4 py-1.5 text-sm text-indigo-300 mb-8">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          AI-Powered Credit Dispute Automation
        </div>
        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight max-w-4xl leading-tight mb-6">
          Disputes filed.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">
            Records erased.
          </span>
        </h1>
        <p className="text-slate-400 text-xl max-w-2xl mb-10 leading-relaxed">
          Expunge analyzes your credit report, applies 30 years of FCRA case law,
          drafts legally precise dispute letters, and dispatches them to all three bureaus — automatically.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/register" className="bg-green-500 hover:bg-green-400 text-black transition px-8 py-4 rounded-xl font-bold text-lg">
            Start free — no card required
          </Link>
          <Link href="/pricing" className="border border-white/20 hover:border-white/40 transition px-8 py-4 rounded-xl font-semibold text-lg text-slate-300 hover:text-white">
            See pricing
          </Link>
        </div>
      </div>

      {/* Feature grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-8 pb-20 max-w-6xl mx-auto w-full">
        {[
          { icon: '🤖', title: 'AI Analysis', desc: 'Master orchestrator classifies every negative item with FCRA legal basis' },
          { icon: '⚖️', title: '8 Specialist Agents', desc: 'Dedicated agents for bankruptcy, collections, fraud, inquiries, and more' },
          { icon: '📬', title: 'Tri-Bureau Dispatch', desc: 'Letters sent to Equifax, Experian, and TransUnion simultaneously' },
          { icon: '📊', title: '30-Day Monitoring', desc: 'Outcome tracker watches every case and escalates automatically' },
        ].map((f) => (
          <div key={f.title} className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="text-3xl mb-3">{f.icon}</div>
            <div className="font-semibold mb-1">{f.title}</div>
            <div className="text-slate-400 text-sm">{f.desc}</div>
          </div>
        ))}
      </div>
    </main>
  )
}
