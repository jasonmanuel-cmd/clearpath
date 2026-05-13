import { runAgent } from '@/lib/claude'
import { createServiceClient } from '@/lib/supabase/server'
import type { DisputeType, Bureau, OutcomeResult } from '@/lib/types'

export interface OutcomeContext {
  disputeType: DisputeType
  bureau: Bureau
  legalBasisUsed: string
  strategySummary: string
  letterTone: string
  letterContent: string
  outcome: OutcomeResult
  daysToResponse: number
  round: number
  accountName: string
  amount?: number
}

const SYSTEM_PROMPT = `You are the Intelligence Layer for ClearPath AI — the learning brain of the system.
Your job is to analyze the outcome of a completed credit dispute and extract actionable insights that will make future disputes stronger.

You receive the full context of a dispute: what was disputed, which legal basis was used, what strategy was employed, what the bureau response was, and how long it took.

Extract a structured insight that captures:
1. WHY this outcome occurred (what worked or didn't work)
2. What should be done differently next time for this dispute type + bureau combination
3. How confident we should be in this strategy going forward
4. Any patterns worth noting (timing, tone, legal citation effectiveness)

Respond with valid JSON:
{
  "insight": "<1-3 sentence actionable learning for future disputes>",
  "strategyEffective": <true|false>,
  "confidenceScore": <0.0-1.0, based on outcome strength>,
  "successRate": <0.0-1.0, 1.0 for removed, 0.7 for modified, 0.1 for verified, 0.0 for no_response>,
  "keyFactor": "<the single most important factor that influenced this outcome>",
  "recommendedAdjustment": "<specific change to make for next similar dispute>"
}`

interface LearningOutput {
  insight: string
  strategyEffective: boolean
  confidenceScore: number
  successRate: number
  keyFactor: string
  recommendedAdjustment: string
}

export async function processOutcome(ctx: OutcomeContext): Promise<void> {
  const supabase = createServiceClient()

  const userMessage = `Analyze this completed dispute outcome:

DISPUTE DETAILS:
- Account: ${ctx.accountName}${ctx.amount ? ` ($${ctx.amount.toLocaleString()})` : ''}
- Type: ${ctx.disputeType}
- Bureau: ${ctx.bureau}
- Round: ${ctx.round}
- Legal basis used: ${ctx.legalBasisUsed}
- Letter tone: ${ctx.letterTone}
- Strategy summary: ${ctx.strategySummary}
- Days to response: ${ctx.daysToResponse}

OUTCOME: ${ctx.outcome.toUpperCase()}

LETTER EXCERPT (first 800 chars):
${ctx.letterContent.slice(0, 800)}

Extract the learning insight for this outcome.`

  let learning: LearningOutput
  try {
    const response = await runAgent(SYSTEM_PROMPT, userMessage, true)
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in learning response')
    learning = JSON.parse(jsonMatch[0]) as LearningOutput
  } catch {
    // Fallback learning if parsing fails
    learning = {
      insight: `${ctx.disputeType} dispute at ${ctx.bureau} with ${ctx.legalBasisUsed} resulted in ${ctx.outcome} after ${ctx.daysToResponse} days.`,
      strategyEffective: ctx.outcome === 'removed' || ctx.outcome === 'modified',
      confidenceScore: ctx.outcome === 'removed' ? 0.8 : ctx.outcome === 'modified' ? 0.6 : 0.3,
      successRate: ctx.outcome === 'removed' ? 1.0 : ctx.outcome === 'modified' ? 0.7 : ctx.outcome === 'verified' ? 0.1 : 0.0,
      keyFactor: ctx.legalBasisUsed,
      recommendedAdjustment: ctx.outcome === 'no_response' ? 'Escalate to Round 2 immediately' : 'Continue with current approach',
    }
  }

  // Upsert into orchestrator_memory — update existing record or create new one
  const { data: existing } = await supabase
    .from('orchestrator_memory')
    .select('id, sample_count, success_rate, avg_days_to_response, confidence_score')
    .eq('dispute_type', ctx.disputeType)
    .eq('bureau', ctx.bureau)
    .eq('legal_basis_used', ctx.legalBasisUsed)
    .eq('outcome', ctx.outcome)
    .eq('round', ctx.round)
    .maybeSingle()

  if (existing) {
    const newSampleCount = (existing.sample_count ?? 1) + 1
    const newSuccessRate = (
      ((existing.success_rate ?? 0) * (existing.sample_count ?? 1)) + learning.successRate
    ) / newSampleCount
    const newAvgDays = (
      ((existing.avg_days_to_response ?? ctx.daysToResponse) * (existing.sample_count ?? 1)) + ctx.daysToResponse
    ) / newSampleCount
    const newConfidence = Math.min(0.95, (existing.confidence_score ?? 0.5) * 0.7 + learning.confidenceScore * 0.3)

    await supabase
      .from('orchestrator_memory')
      .update({
        insight: learning.insight,
        confidence_score: newConfidence,
        success_rate: newSuccessRate,
        avg_days_to_response: newAvgDays,
        sample_count: newSampleCount,
        strategy_summary: ctx.strategySummary,
        letter_tone: ctx.letterTone,
        last_updated: new Date().toISOString(),
      })
      .eq('id', existing.id)
  } else {
    await supabase.from('orchestrator_memory').insert({
      dispute_type: ctx.disputeType,
      bureau: ctx.bureau,
      legal_basis_used: ctx.legalBasisUsed,
      strategy_summary: ctx.strategySummary,
      letter_tone: ctx.letterTone,
      outcome: ctx.outcome,
      avg_days_to_response: ctx.daysToResponse,
      round: ctx.round,
      insight: learning.insight,
      confidence_score: learning.confidenceScore,
      success_rate: learning.successRate,
      sample_count: 1,
    })
  }
}
