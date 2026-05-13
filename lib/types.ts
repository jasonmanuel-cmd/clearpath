export type DisputeType =
  | 'bankruptcy'
  | 'credit_card'
  | 'mortgage'
  | 'auto'
  | 'collections'
  | 'public_record'
  | 'fraud'
  | 'inquiry'

export type Bureau = 'equifax' | 'experian' | 'transunion' | 'data_furnisher'

export type CaseStatus = 'analyzing' | 'routing' | 'active' | 'monitoring' | 'completed' | 'escalated'

export type DisputeItemStatus =
  | 'pending'
  | 'letter_drafted'
  | 'dispatched'
  | 'filed'
  | 'under_review'
  | 'received'
  | 'removed'
  | 'modified'
  | 'verified'
  | 'no_response'

export type OutcomeResult = 'removed' | 'modified' | 'verified' | 'no_response'

export interface OrchestratorItem {
  type: DisputeType
  accountName: string
  accountNumber?: string
  bureau: Bureau | 'all'
  amount?: number
  disputeReason: string
  legalBasis: string
  priority: number
  historicalSuccessNote?: string
}

export interface OrchestratorOutput {
  summary: string
  items: OrchestratorItem[]
  totalDisputableItems: number
  confidenceNotes?: string
}

export interface SpecialistOutput {
  strategy: string
  legalCitations: string[]
  keyArguments: string[]
  letterTone: 'firm' | 'conciliatory' | 'urgent'
}
