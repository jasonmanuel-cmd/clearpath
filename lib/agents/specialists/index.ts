import { runAgent } from '@/lib/claude'
import type { DisputeType, OrchestratorItem, SpecialistOutput } from '@/lib/types'

function buildSpecialistPrompt(type: DisputeType): string {
  const basePrompt = `You are a specialist FCRA attorney for ClearPath AI, expert in ${type.replace('_', ' ')} disputes.
Analyze the dispute item and provide a targeted legal strategy.

Respond with JSON:
{
  "strategy": "<detailed dispute strategy>",
  "legalCitations": ["<FCRA §XXX: description>"],
  "keyArguments": ["<argument 1>", "<argument 2>"],
  "letterTone": "firm|conciliatory|urgent"
}`

  const specializations: Record<DisputeType, string> = {
    bankruptcy: 'Focus on §605 obsolescence (10-year limit), discharge completeness, and associated account reporting accuracy.',
    credit_card: 'Focus on §623 furnisher accuracy, payment history errors, balance discrepancies, and account status errors.',
    mortgage: 'Focus on §623 accuracy, foreclosure reporting, modification agreements, and loan servicer transfer errors.',
    auto: 'Focus on §623 accuracy, repossession procedure compliance, deficiency balance accuracy, and title issues.',
    collections: 'Focus on §809 debt validation, §623 accuracy, statute of limitations, re-aging violations, and §615 adverse action notices.',
    public_record: 'Focus on §605 accuracy and obsolescence, court record matching, and judgment satisfaction reporting.',
    fraud: 'Focus on §605B (identity theft blocking), §611 dispute rights, fraud alert placement, and §623 furnisher liability.',
    inquiry: 'Focus on §604 permissible purpose, §611 dispute rights, and §616/617 willful/negligent violations.',
  }

  return `${basePrompt}\n\nSpecialization: ${specializations[type]}`
}

export async function runSpecialistAgent(
  item: OrchestratorItem,
  consumerName: string
): Promise<SpecialistOutput> {
  const systemPrompt = buildSpecialistPrompt(item.type)
  const userMessage = `Analyze this dispute item for ${consumerName}:\n${JSON.stringify(item, null, 2)}`

  const response = await runAgent(systemPrompt, userMessage, true)

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in specialist response')
    return JSON.parse(jsonMatch[0]) as SpecialistOutput
  } catch {
    return {
      strategy: response.slice(0, 500),
      legalCitations: ['FCRA §611'],
      keyArguments: ['Information is inaccurate and unverifiable'],
      letterTone: 'firm',
    }
  }
}
