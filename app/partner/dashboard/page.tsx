import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const STATUS_COLORS: Record<string, string> = {
  analyzing: 'text-yellow-400',
  routing: 'text-blue-400',
  active: 'text-indigo-400',
  monitoring: 'text-cyan-400',
  completed: 'text-green-400',
  escalated: 'text-red-400',
}

export default async function PartnerDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'partner') redirect('/dashboard')

  const { data: clients } = await supabase
    .from('partner_clients')
    .select(`
      consumer_id,
      profiles!partner_clients_consumer_id_fkey(full_name, email),
      cases:cases!cases_user_id_fkey(
        id, status, created_at,
        dispute_items(id, status)
      )
    `)
    .eq('partner_id', user.id)

  const totalClients = clients?.length ?? 0
  const activeClients = clients?.filter((c) =>
    (c.cases as { status: string }[] ?? []).some((cas) => ['active', 'monitoring', 'escalated'].includes(cas.status))
  ).length ?? 0

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center font-bold text-sm">CP</div>
          <div>
            <span className="font-semibold">ClearPath AI</span>
            <span className="ml-2 text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full">Partner</span>
          </div>
        </div>
        <span className="text-slate-400 text-sm">{profile?.full_name || user.email}</span>
      </header>

      <div className="max-w-6xl mx-auto px-8 py-10">
        <h1 className="text-2xl font-bold mb-8">Partner Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6">
            <div className="text-4xl font-bold mb-1">{totalClients}</div>
            <div className="text-slate-400 text-sm">Total clients</div>
          </div>
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6">
            <div className="text-4xl font-bold text-indigo-400 mb-1">{activeClients}</div>
            <div className="text-slate-400 text-sm">Active disputes</div>
          </div>
        </div>

        {/* Client roster */}
        <h2 className="text-lg font-semibold mb-4">Client roster</h2>

        {!clients || clients.length === 0 ? (
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-16 text-center">
            <div className="text-5xl mb-4">👥</div>
            <div className="font-semibold text-lg mb-2">No clients yet</div>
            <div className="text-slate-400 text-sm">Clients will appear here once they link to your partner account</div>
          </div>
        ) : (
          <div className="space-y-3">
            {clients.map((client) => {
              const cases = client.cases as Array<{ id: string; status: string; created_at: string; dispute_items: Array<{ id: string; status: string }> }> ?? []
              const allItems = cases.flatMap((c) => c.dispute_items ?? [])
              const removedCount = allItems.filter((i) => i.status === 'removed').length
              const totalCount = allItems.length
              const latestCase = cases.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
              const profile = (Array.isArray(client.profiles) ? client.profiles[0] : client.profiles) as { full_name: string; email: string } | null

              return (
                <div key={client.consumer_id} className="bg-slate-900 border border-white/10 rounded-2xl p-5 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{profile?.full_name || 'Unknown'}</div>
                    <div className="text-slate-400 text-sm">{profile?.email}</div>
                    <div className="text-slate-500 text-xs mt-1">
                      {totalCount} items disputed · {removedCount} removed
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {latestCase && (
                      <div className={`text-sm font-medium ${STATUS_COLORS[latestCase.status] ?? 'text-slate-400'}`}>
                        {latestCase.status.replace('_', ' ').toUpperCase()}
                      </div>
                    )}
                    {latestCase && (
                      <Link
                        href={`/disputes/${latestCase.id}`}
                        className="text-sm text-indigo-400 hover:text-indigo-300 transition"
                      >
                        View →
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
