import { runAgent } from '@/lib/claude'
import type { OrchestratorItem } from '@/lib/types'

const SYSTEM_PROMPT = `You are the Escalation Bot for ClearPath AI.
You handle Round 2 dispute letters and CFPB complaint drafts when bureaus fail to respond or resolve disputes.

For Round 2 letters:
- Reference the original dispute and the bureau's failure to respond or inadequate response
- Cite FCRA §611(a)(1) — 30-day investigation window violation
- Cite FCRA §616-617 — civil liability for willful/negligent noncompliance
- Demand immediate deletion as remedy for procedural failure
- State intent to file CFPB complaint and pursue civil litigation

For CFPB complaints:
- Structure as a formal regulatory complaint
- Include timeline of dispute attempts
- Cite specific violations
- Request CFPB intervention and investigation`

export async function runEscalationBot(
  item: OrchestratorItem,
  consumerName: string,
  originalDisputeDate: string,
  bureauResponse: string,
  round: number
): Promise<{ round2Letter: string; cfpbComplaint: string }> {
  const [round2Letter, cfpbComplaint] = await Promise.all([
    runAgent(
      SYSTEM_PROMPT,
      `Draft Round ${round} escalation letter for ${consumerName}.
Original dispute filed: ${originalDisputeDate}
Bureau response: ${bureauResponse || 'No response received'}
Dispute item: ${JSON.stringify(item, null, 2)}`,
      true
    ),
    runAgent(
      SYSTEM_PROMPT,
      `Draft CFPB complaint for ${consumerName}.
Original dispute filed: ${originalDisputeDate}
Bureau response: ${bureauResponse || 'No response received'}
Dispute item: ${JSON.stringify(item, null, 2)}
Format as a formal CFPB complaint submission.`,
      true
    ),
  ])

  return { round2Letter, cfpbComplaint }
}
