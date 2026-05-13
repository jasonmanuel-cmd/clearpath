import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const STATUS_COLORS: Record<string, string> = {
  analyzing: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  routing: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  active: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
  monitoring: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  completed: 'bg-green-500/10 text-green-400 border-green-500/30',
  escalated: 'bg-red-500/10 text-red-400 border-red-500/30',
}

const ITEM_STATUS_COLORS: Record<string, string> = {
  pending: 'text-slate-400',
  letter_drafted: 'text-blue-400',
  dispatched: 'text-indigo-400',
  filed: 'text-cyan-400',
  under_review: 'text-yellow-400',
  received: 'text-orange-400',
  removed: 'text-green-400',
  modified: 'text-emerald-400',
  verified: 'text-red-400',
  no_response: 'text-red-500',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'partner') redirect('/partner/dashboard')

  const { data: cases } = await supabase
    .from('cases')
    .select('*, dispute_items(id, type, account_name, status, bureau)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const totalItems = cases?.flatMap((c) => c.dispute_items).length ?? 0
  const removedItems = cases?.flatMap((c) => c.dispute_items).filter((i) => i.status === 'removed').length ?? 0
  const activeItems = cases?.flatMap((c) => c.dispute_items).filter((i) => ['filed', 'under_review', 'dispatched'].includes(i.status)).length ?? 0

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center font-bold text-sm text-black">EX</div>
          <span className="font-semibold">Expunge</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/billing" className="text-sm text-slate-400 hover:text-white transition">Billing</Link>
          <span className="text-slate-400 text-sm">{profile?.full_name || user.email}</span>
          <Link href="/upload" className="bg-indigo-600 hover:bg-indigo-500 transition px-4 py-2 rounded-lg text-sm font-medium">
            + New dispute
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-8 py-10">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: 'Total items disputed', value: totalItems, color: 'text-white' },
            { label: 'Items in progress', value: activeItems, color: 'text-indigo-400' },
            { label: 'Items removed', value: removedItems, color: 'text-green-400' },
          ].map((s) => (
            <div key={s.label} className="bg-slate-900 border border-white/10 rounded-2xl p-6">
              <div className={`text-4xl font-bold mb-1 ${s.color}`}>{s.value}</div>
              <div className="text-slate-400 text-sm">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Cases */}
        <h2 className="text-xl font-semibold mb-4">Your cases</h2>

        {!cases || cases.length === 0 ? (
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-16 text-center">
            <div className="text-5xl mb-4">📋</div>
            <div className="font-semibold text-lg mb-2">No disputes yet</div>
            <div className="text-slate-400 text-sm mb-6">Upload your credit report to get started</div>
            <Link href="/upload" className="bg-indigo-600 hover:bg-indigo-500 transition px-6 py-3 rounded-lg font-medium">
              Upload credit report
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {cases.map((c) => (
              <div key={c.id} className="bg-slate-900 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="font-semibold">Case #{c.id.slice(0, 8).toUpperCase()}</div>
                    <div className="text-slate-400 text-sm">
                      {new Date(c.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium border px-3 py-1 rounded-full ${STATUS_COLORS[c.status] ?? 'text-slate-400'}`}>
                      {c.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <Link href={`/disputes/${c.id}`} className="text-sm text-indigo-400 hover:text-indigo-300 transition">
                      View details →
                    </Link>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {(c.dispute_items ?? []).slice(0, 8).map((item: { id: string; account_name: string; type: string; bureau: string; status: string }) => (
                    <div key={item.id} className="bg-slate-800 rounded-lg px-3 py-2">
                      <div className="text-xs font-medium truncate">{item.account_name}</div>
                      <div className="text-xs text-slate-500 capitalize">{item.type.replace('_', ' ')} · {item.bureau}</div>
                      <div className={`text-xs font-medium mt-1 ${ITEM_STATUS_COLORS[item.status] ?? 'text-slate-400'}`}>
                        {item.status.replace('_', ' ')}
                      </div>
                    </div>
                  ))}
                  {(c.dispute_items ?? []).length > 8 && (
                    <div className="bg-slate-800 rounded-lg px-3 py-2 flex items-center justify-center">
                      <span className="text-xs text-slate-400">+{c.dispute_items.length - 8} more</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
