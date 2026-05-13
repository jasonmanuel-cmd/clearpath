import { anthropic, MODEL } from '@/lib/claude'
import { retrieveKnowledge } from '@/lib/agents/knowledge-retriever'
import type { OrchestratorOutput, DisputeType, Bureau } from '@/lib/types'

const BASE_SYSTEM_PROMPT = `You are the Master Orchestrator for ClearPath AI — the most advanced AI credit dispute system ever built.
You are a senior FCRA attorney and credit analyst with deep knowledge of 30 years of credit dispute history, case law, bureau behavior patterns, and real-world outcome data.

Your role:
1. Analyze credit reports to identify ALL disputable negative items
2. Apply your full knowledge of FCRA law, case law, bureau patterns, and past dispute outcomes
3. Classify each item by type and assign the strongest legal basis available
4. Set confidence scores based on historical success rates from memory

Dispute types:
- bankruptcy: Chapter 7/11/13 records
- credit_card: Credit card account errors
- mortgage: Mortgage/home loan issues
- auto: Auto loan errors
- collections: Collection accounts
- public_record: Judgments, liens, civil records
- fraud: Unauthorized accounts, identity theft
- inquiry: Unauthorized hard inquiries

You must respond with valid JSON:
{
  "summary": "Overview of findings and overall dispute strength",
  "totalDisputableItems": <number>,
  "confidenceNotes": "Brief note on confidence level based on historical data",
  "items": [
    {
      "type": "<dispute_type>",
      "accountName": "<creditor name>",
      "accountNumber": "<last 4 or null>",
      "bureau": "<equifax|experian|transunion|all>",
      "amount": <number or null>,
      "disputeReason": "<specific, legally precise reason>",
      "legalBasis": "<FCRA section(s) — be specific>",
      "priority": <1-10>,
      "historicalSuccessNote": "<what past outcomes for this type suggest>"
    }
  ]
}

Use your knowledge base and memory to make each dispute as strong as possible. Cite specific cases and patterns when relevant.`

export async function runOrchestrator(creditReportText: string): Promise<OrchestratorOutput> {
  // Detect likely dispute types from report text for knowledge retrieval
  const likelyTypes = detectDisputeTypes(creditReportText)
  const likelyBureaus: Bureau[] = ['equifax', 'experian', 'transunion']

  const { knowledgeBase, orchestratorMemory, hasMemory } = await retrieveKnowledge(
    likelyTypes,
    likelyBureaus
  )

  // Build enriched system prompt with KB + memory (all prompt-cached)
  const enrichedSystemPrompt = [
    BASE_SYSTEM_PROMPT,
    knowledgeBase ? `\n\n${knowledgeBase}` : '',
    orchestratorMemory ? `\n\n${orchestratorMemory}` : '',
    hasMemory ? '\n\nApply the learned memory patterns above to adjust your confidence and strategy for each item.' : '',
  ].join('')

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 8192,
    system: [
      {
        type: 'text',
        text: enrichedSystemPrompt,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [
      {
        role: 'user',
        content: `Please analyze this credit report and identify all disputable items:\n\n${creditReportText}`,
      },
    ],
  })

  const block = response.content[0]
  if (block.type !== 'text') throw new Error('Unexpected response type from orchestrator')

  try {
    const jsonMatch = block.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in orchestrator response')
    return JSON.parse(jsonMatch[0]) as OrchestratorOutput
  } catch {
    throw new Error(`Failed to parse orchestrator output: ${block.text.slice(0, 200)}`)
  }
}

function detectDisputeTypes(text: string): DisputeType[] {
  const lower = text.toLowerCase()
  const types: DisputeType[] = []

  if (lower.includes('bankruptcy') || lower.includes('chapter 7') || lower.includes('chapter 13')) types.push('bankruptcy')
  if (lower.includes('credit card') || lower.includes('visa') || lower.includes('mastercard') || lower.includes('charge')) types.push('credit_card')
  if (lower.includes('mortgage') || lower.includes('home loan') || lower.includes('foreclosure')) types.push('mortgage')
  if (lower.includes('auto') || lower.includes('vehicle') || lower.includes('car loan') || lower.includes('repossess')) types.push('auto')
  if (lower.includes('collection') || lower.includes('charged off') || lower.includes('delinquent')) types.push('collections')
  if (lower.includes('judgment') || lower.includes('lien') || lower.includes('civil')) types.push('public_record')
  if (lower.includes('fraud') || lower.includes('unauthorized') || lower.includes('identity')) types.push('fraud')
  if (lower.includes('inquiry') || lower.includes('inquiries')) types.push('inquiry')

  // Default to most common types if nothing detected
  if (types.length === 0) {
    types.push('credit_card', 'collections', 'inquiry')
  }

  return types
}
