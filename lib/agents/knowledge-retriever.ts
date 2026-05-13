import { createServiceClient } from '@/lib/supabase/server'
import type { DisputeType, Bureau } from '@/lib/types'

export interface KnowledgeContext {
  knowledgeBase: string
  orchestratorMemory: string
  hasMemory: boolean
}

export async function retrieveKnowledge(
  disputeTypes: DisputeType[],
  bureaus: Bureau[]
): Promise<KnowledgeContext> {
  const supabase = createServiceClient()

  // Query knowledge base: all relevant entries for these dispute types and bureaus
  const { data: kbEntries } = await supabase
    .from('dispute_knowledge_base')
    .select('category, title, content, source, year, effectiveness_score')
    .or([
      `dispute_types.cs.{${disputeTypes.join(',')}}`,
      `bureaus.cs.{${bureaus.join(',')}}`,
      `categories.in.(fcra_law,case_law)`,
    ].join(','))
    .order('effectiveness_score', { ascending: false })
    .limit(20)

  // Query orchestrator memory: past learnings for these dispute types
  const { data: memories } = await supabase
    .from('orchestrator_memory')
    .select('dispute_type, bureau, legal_basis_used, outcome, insight, confidence_score, sample_count, success_rate, avg_days_to_response')
    .in('dispute_type', disputeTypes)
    .order('confidence_score', { ascending: false })
    .order('sample_count', { ascending: false })
    .limit(15)

  const knowledgeBase = formatKnowledgeBase(kbEntries ?? [])
  const orchestratorMemory = formatMemory(memories ?? [])

  return {
    knowledgeBase,
    orchestratorMemory,
    hasMemory: (memories?.length ?? 0) > 0,
  }
}

function formatKnowledgeBase(entries: Array<{
  category: string; title: string; content: string;
  source?: string; year?: number; effectiveness_score?: number
}>): string {
  if (entries.length === 0) return ''

  const grouped = entries.reduce<Record<string, typeof entries>>((acc, e) => {
    if (!acc[e.category]) acc[e.category] = []
    acc[e.category].push(e)
    return acc
  }, {})

  const sections = Object.entries(grouped).map(([cat, items]) => {
    const header = cat.replace(/_/g, ' ').toUpperCase()
    const content = items.map((e) =>
      `### ${e.title}${e.year ? ` (${e.year})` : ''}
${e.content}
${e.source ? `Source: ${e.source}` : ''}`
    ).join('\n\n')
    return `## ${header}\n\n${content}`
  })

  return `=== KNOWLEDGE BASE: 30 YEARS OF FCRA DISPUTE HISTORY ===\n\n${sections.join('\n\n---\n\n')}`
}

function formatMemory(memories: Array<{
  dispute_type: string; bureau: string; legal_basis_used: string;
  outcome: string; insight: string; confidence_score?: number;
  sample_count?: number; success_rate?: number; avg_days_to_response?: number
}>): string {
  if (memories.length === 0) return ''

  const lines = memories.map((m) => {
    const successPct = m.success_rate !== undefined ? `${Math.round(m.success_rate * 100)}%` : 'unknown'
    const days = m.avg_days_to_response ? `~${Math.round(m.avg_days_to_response)}d` : '?'
    return `- [${m.dispute_type.toUpperCase()} @ ${m.bureau}] outcome:${m.outcome} | success_rate:${successPct} | avg_response:${days} | samples:${m.sample_count ?? 1} | confidence:${((m.confidence_score ?? 0) * 100).toFixed(0)}%
  Legal basis: ${m.legal_basis_used}
  Insight: ${m.insight}`
  }).join('\n\n')

  return `=== ORCHESTRATOR LEARNED MEMORY (${memories.length} patterns from real outcomes) ===\n\n${lines}`
}
