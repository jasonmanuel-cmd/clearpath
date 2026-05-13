import { runAgent } from '@/lib/claude'
import type { Bureau, OrchestratorItem, SpecialistOutput } from '@/lib/types'

const BUREAU_ADDRESSES: Record<Bureau, string> = {
  equifax: 'Equifax Information Services LLC\nP.O. Box 740256\nAtlanta, GA 30374-0256',
  experian: 'Experian\nP.O. Box 4500\nAllen, TX 75013',
  transunion: 'TransUnion LLC\nConsumer Dispute Center\nP.O. Box 2000\nChester, PA 19016',
  data_furnisher: '[Data Furnisher Address]',
}

const SYSTEM_PROMPT = `You are the Letter Bot for ClearPath AI, specialized in drafting FCRA-compliant dispute letters.

Write formal, legally precise dispute letters that:
1. Open with the consumer's identity and the specific account being disputed
2. State the FCRA violation and legal basis clearly
3. Demand specific corrective action (investigation, deletion, or correction)
4. Reference the 30-day investigation window under FCRA §611(a)(1)
5. Demand written notification of results under FCRA §611(a)(6)
6. Close with a statement of intent to pursue legal remedies if unresolved

Tone must be professional but firm. Include all relevant legal citations.
Do NOT include placeholders — write the complete letter body only (no "Dear [Name]" blanks).`

export async function generateLetter(
  item: OrchestratorItem,
  specialistOutput: SpecialistOutput,
  consumer: { name: string; address: string; ssn_last4: string; dob: string },
  bureau: Bureau,
  round: number,
  isCfpbComplaint = false
): Promise<string> {
  const bureauAddress = BUREAU_ADDRESSES[bureau]
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  const prompt = `Write a ${round > 1 ? 'Round ' + round + ' escalation ' : ''}dispute letter for:

Consumer: ${consumer.name}
Address: ${consumer.address}
SSN Last 4: ${consumer.ssn_last4}
DOB: ${consumer.dob}
Date: ${today}

Recipient:
${bureauAddress}

Dispute Item:
${JSON.stringify(item, null, 2)}

Legal Strategy:
${JSON.stringify(specialistOutput, null, 2)}

${isCfpbComplaint ? 'NOTE: This is a CFPB complaint — reference the CFPB complaint portal and note this complaint is being filed simultaneously.' : ''}

Write the complete letter now:`

  return runAgent(SYSTEM_PROMPT, prompt, true)
}
