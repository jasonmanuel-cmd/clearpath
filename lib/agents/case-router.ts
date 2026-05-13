import { runAgent } from '@/lib/claude'
import type { OrchestratorItem, DisputeType } from '@/lib/types'

const SYSTEM_PROMPT = `You are the Case Routing Engine for ClearPath AI.
Your job is to receive classified dispute items and assign each to the correct specialist agent,
then determine the optimal processing order for maximum credit score impact.

Specialist agents available:
- bankruptcy: Handles Chapter 7, 11, 13 bankruptcy records
- credit_card: Handles credit card account disputes
- mortgage: Handles mortgage and home equity loan disputes
- auto: Handles auto loan and lease disputes
- collections: Handles third-party collection account disputes
- public_record: Handles civil judgments, tax liens, court records
- fraud: Handles identity theft, unauthorized accounts, fraudulent inquiries
- inquiry: Handles unauthorized hard inquiries

Return JSON with this structure:
{
  "routedItems": [
    {
      "itemIndex": <original index from input array>,
      "specialist": "<specialist type>",
      "processingOrder": <1-based order>,
      "rationale": "<brief reason for routing decision>"
    }
  ]
}`

export interface RoutedItem {
  itemIndex: number
  specialist: DisputeType
  processingOrder: number
  rationale: string
}

export async function routeCases(items: OrchestratorItem[]): Promise<RoutedItem[]> {
  const response = await runAgent(
    SYSTEM_PROMPT,
    `Route these dispute items to specialist agents:\n\n${JSON.stringify(items, null, 2)}`,
    true
  )

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in router response')
    const parsed = JSON.parse(jsonMatch[0])
    return parsed.routedItems as RoutedItem[]
  } catch {
    return items.map((_, i) => ({
      itemIndex: i,
      specialist: items[i].type,
      processingOrder: i + 1,
      rationale: 'Default routing by type',
    }))
  }
}
