export interface KnowledgeRecord {
  category: string
  subcategory?: string
  title: string
  content: string
  source?: string
  year?: number
  dispute_types?: string[]
  bureaus?: string[]
  tags?: string[]
  effectiveness_score?: number
}

export const KNOWLEDGE_SEED: KnowledgeRecord[] = [
  // ─── FCRA STATUTORY LAW ───────────────────────────────────────────────────
  {
    category: 'fcra_law',
    subcategory: 'dispute_rights',
    title: 'FCRA §611 — Consumer Dispute Rights & Reinvestigation',
    content: `Under 15 U.S.C. §1681i, consumers have the right to dispute inaccurate or incomplete information. Key provisions:
- CRA must complete investigation within 30 days (45 days if consumer submits additional information)
- CRA must forward dispute and all relevant information to furnisher within 5 business days
- If CRA cannot verify information, it MUST be deleted
- Consumer must receive written results of investigation
- Consumer may add 100-word statement if dispute is not resolved in their favor
- Free credit report must be provided after successful dispute
- Reinvestigation requirement applies to all items, not just "obviously erroneous" ones (Cushman v. Trans Union, 1997)`,
    source: '15 U.S.C. §1681i',
    year: 1996,
    dispute_types: ['bankruptcy', 'credit_card', 'mortgage', 'auto', 'collections', 'public_record', 'fraud', 'inquiry'],
    bureaus: ['equifax', 'experian', 'transunion'],
    tags: ['dispute_rights', 'reinvestigation', '30_day_window', 'deletion'],
    effectiveness_score: 1.0,
  },
  {
    category: 'fcra_law',
    subcategory: 'furnisher_obligations',
    title: 'FCRA §623 — Furnisher Duty to Report Accurate Information',
    content: `15 U.S.C. §1681s-2 imposes duties on furnishers of information:
Part (a) — Duty to provide accurate information: Furnishers may NOT report info they know or have reasonable cause to believe is inaccurate. Must correct and update information. Must not report info after notice of discharge in bankruptcy.
Part (b) — Duties upon notice of dispute: After receiving notice from CRA of a consumer dispute, furnisher MUST:
  1. Conduct an investigation of the disputed information
  2. Review all relevant information provided by CRA
  3. Report results to CRA
  4. If inaccurate or cannot be verified — modify, delete, or permanently block
  5. Notify CRA of any inaccuracy
Direct disputes to furnisher (added by FACTA 2003): Consumers may dispute directly with furnisher. Furnisher must investigate within 30 days. This is in ADDITION to bureau dispute rights.`,
    source: '15 U.S.C. §1681s-2',
    year: 1996,
    dispute_types: ['credit_card', 'mortgage', 'auto', 'collections', 'public_record'],
    bureaus: ['equifax', 'experian', 'transunion', 'data_furnisher'],
    tags: ['furnisher_duties', 'accuracy', 'direct_dispute', 'investigation'],
    effectiveness_score: 0.9,
  },
  {
    category: 'fcra_law',
    subcategory: 'obsolescence',
    title: 'FCRA §605 — Time Limits on Negative Information (7-Year / 10-Year Rule)',
    content: `15 U.S.C. §1681c — Prohibited information:
7-YEAR ITEMS (must be removed after 7 years from date of first delinquency):
- Collection accounts (from date of original delinquency, NOT date sold to collector)
- Charge-offs
- Late payments
- Civil judgments (Note: In most states, judgments now obsolete after 7 years due to FCRA)
- Tax liens (paid liens: 7 years from date of payment; unpaid: 7 years from date filed)
- Chapter 13 bankruptcy

10-YEAR ITEMS:
- Chapter 7, 11 bankruptcy (10 years from filing date)

STARTING DATE RULES:
- For collection accounts: clock starts from the date of first delinquency on the ORIGINAL account, NOT when it was sold/assigned
- Re-aging violations: changing the delinquency date to extend reporting period is a federal violation
- Key case: Daley v. A&S Collection Associates (1997) — collector re-aging is willful FCRA violation

NEVER OBSOLETE:
- Criminal convictions (no time limit)
- Information in credit applications for loans over $150,000, life insurance over $150,000, or employment paying over $75,000/year`,
    source: '15 U.S.C. §1681c',
    year: 1996,
    dispute_types: ['bankruptcy', 'collections', 'public_record', 'credit_card'],
    bureaus: ['equifax', 'experian', 'transunion'],
    tags: ['obsolescence', '7_year_rule', '10_year_rule', 're_aging', 'bankruptcy'],
    effectiveness_score: 0.95,
  },
  {
    category: 'fcra_law',
    subcategory: 'permissible_purpose',
    title: 'FCRA §604 — Permissible Purposes for Inquiries',
    content: `15 U.S.C. §1681b — A CRA may only furnish a consumer report for a permissible purpose:
PERMISSIBLE: Credit transactions initiated by consumer, employment (with written consent), insurance underwriting, court orders, legitimate business need in connection with business transaction initiated by consumer, child support enforcement.
IMPERMISSIBLE (grounds for dispute and damages): Prescreened offers without proper opt-out, employer pulls without written consent, "account review" after account is closed, debt collection without active account relationship, inquiries by entities with no legitimate need.
HARD vs SOFT INQUIRIES: Only hard inquiries (initiated by consumer applying for credit) affect score. Soft inquiries (account review, prescreened offers, consumer's own checks) do NOT affect score but can still be disputed if unauthorized.
STATUTE OF LIMITATIONS for inquiry violations: 2 years from date of violation, or 5 years if willful.
DAMAGES: Actual damages, statutory damages $100-$1,000 per violation (willful), punitive damages, attorney's fees.`,
    source: '15 U.S.C. §1681b',
    year: 1996,
    dispute_types: ['inquiry', 'fraud'],
    bureaus: ['equifax', 'experian', 'transunion'],
    tags: ['permissible_purpose', 'inquiry', 'unauthorized', 'hard_inquiry'],
    effectiveness_score: 0.85,
  },
  {
    category: 'fcra_law',
    subcategory: 'civil_liability',
    title: 'FCRA §616-617 — Civil Liability for Willful and Negligent Noncompliance',
    content: `§616 — Willful noncompliance: Any person who willfully fails to comply with any FCRA requirement with respect to any consumer is liable:
- Actual damages OR statutory damages $100 to $1,000 per violation
- Punitive damages as the court allows
- Costs and reasonable attorney's fees

§617 — Negligent noncompliance: Any person who is negligent in failing to comply is liable for:
- Actual damages sustained
- Costs and reasonable attorney's fees

KEY APPLICATIONS:
- Bureau failing to delete after 30-day window expires = willful noncompliance
- Bureau re-inserting deleted item without proper notice = willful (§611(a)(5)(B))
- Furnisher continuing to report after dispute notice = negligent at minimum
- Pattern of violations across multiple consumers = class action exposure
- CFPB enforcement actions have resulted in $250M+ in total fines against Equifax, Experian, TransUnion combined since 2012`,
    source: '15 U.S.C. §1681n, §1681o',
    year: 1996,
    dispute_types: ['bankruptcy', 'credit_card', 'mortgage', 'auto', 'collections', 'public_record', 'fraud', 'inquiry'],
    bureaus: ['equifax', 'experian', 'transunion'],
    tags: ['civil_liability', 'willful', 'negligent', 'damages', 'attorney_fees'],
    effectiveness_score: 0.9,
  },
  {
    category: 'fcra_law',
    subcategory: 'identity_theft',
    title: 'FCRA §605B — Block of Information Resulting from Identity Theft',
    content: `15 U.S.C. §1681c-2 (added by FACTA 2003):
BLOCKING REQUIREMENT: CRA must block reporting of information identified by consumer as resulting from identity theft within 4 business days of receiving:
1. Appropriate proof of consumer identity
2. A copy of an identity theft report
3. The consumer's identification of the information resulting from the alleged identity theft
4. A statement by the consumer that the information is not related to any transaction by the consumer

FURNISHER OBLIGATIONS (§615(f)): After receiving notice of identity theft block, furnisher may NOT re-report the blocked information. Violation = willful noncompliance.

POLICE REPORT: A filed police report satisfies the "identity theft report" requirement. An FTC Identity Theft Report (at IdentityTheft.gov) also qualifies and is free.

EXTENDED FRAUD ALERT: Consumer may place 7-year extended fraud alert after identity theft report. Requires lenders to verify identity before extending credit.

CREDIT FREEZE: Free for all consumers since 2018 (Economic Growth, Regulatory Relief, and Consumer Protection Act). Prevents new accounts from being opened.`,
    source: '15 U.S.C. §1681c-2',
    year: 2003,
    dispute_types: ['fraud', 'inquiry'],
    bureaus: ['equifax', 'experian', 'transunion'],
    tags: ['identity_theft', 'block', 'fraud_alert', 'police_report', 'facta'],
    effectiveness_score: 0.95,
  },

  // ─── LANDMARK CASE LAW ───────────────────────────────────────────────────
  {
    category: 'case_law',
    subcategory: 'reinvestigation_standard',
    title: 'Cushman v. Trans Union Corp. (3d Cir. 1997) — Reasonable Reinvestigation Standard',
    content: `915 F. Supp. 544 (E.D. Pa. 1996), aff'd 115 F.3d 220 (3d Cir. 1997).
HOLDING: The FCRA requires CRAs to conduct a "reasonable reinvestigation" — not merely forwarding the dispute to the furnisher and accepting their response at face value.
IMPACT: Established that CRAs cannot simply rubber-stamp furnisher responses. Must weigh consumer's evidence and documentation against furnisher's verification.
STRATEGIC APPLICATION: When a bureau claims "verified" without explaining HOW they verified, cite Cushman. Demand the bureau describe their specific reinvestigation procedures and what evidence they considered. A form letter "verified" response likely violates this standard.
FOLLOW-ON CASES: Stevenson v. TRW Inc. (5th Cir. 1993) — similar standard; Johnson v. MBNA America Bank (4th Cir. 2004) — furnisher must review original documents, not just computer records.`,
    source: 'Cushman v. Trans Union Corp., 115 F.3d 220 (3d Cir. 1997)',
    year: 1997,
    dispute_types: ['credit_card', 'collections', 'mortgage', 'auto'],
    bureaus: ['equifax', 'experian', 'transunion'],
    tags: ['reasonable_reinvestigation', 'verified_response', 'case_law'],
    effectiveness_score: 0.9,
  },
  {
    category: 'case_law',
    subcategory: 'furnisher_liability',
    title: 'Johnson v. MBNA America Bank (4th Cir. 2004) — Furnisher Must Review Original Documents',
    content: `357 F.3d 426 (4th Cir. 2004).
HOLDING: When a consumer disputes account ownership (e.g., identity theft, authorized user mixup), the furnisher's reinvestigation obligation under §623(b) requires reviewing original account documents, not just querying a computer database.
FACTS: Consumer disputed that she was liable for MBNA account; furnisher "verified" by checking computer records only. Court found this insufficient.
STRATEGIC APPLICATION: In fraud/identity theft cases and cases where account ownership is disputed, argue that a "verified" response based purely on computer records violates FCRA §623(b). Demand the furnisher produce original account application, signature card, or agreement.
RELATED: Gorman v. Wolpoff & Abramson, 584 F.3d 1147 (9th Cir. 2009) — furnisher's duty to investigate is triggered by notice from CRA, not direct consumer contact alone.`,
    source: 'Johnson v. MBNA America Bank, 357 F.3d 426 (4th Cir. 2004)',
    year: 2004,
    dispute_types: ['fraud', 'credit_card'],
    bureaus: ['equifax', 'experian', 'transunion', 'data_furnisher'],
    tags: ['furnisher_liability', 'original_documents', 'identity_theft', 'case_law'],
    effectiveness_score: 0.85,
  },
  {
    category: 'case_law',
    subcategory: 'reaging',
    title: 'Daley v. A&S Collection Associates (D. Or. 1997) — Re-Aging is Willful FCRA Violation',
    content: `No. 96-6244, 1997 WL 816518 (D. Or. Aug. 19, 1997).
HOLDING: Deliberately changing a debt's delinquency date to extend the 7-year reporting period constitutes willful noncompliance under FCRA §616.
RE-AGING TACTICS TO RECOGNIZE:
- Changing "date of first delinquency" when debt is sold to new collector
- Resetting the clock each time the debt changes hands
- Reporting a "new" delinquency date after a partial payment
- Changing account open date instead of delinquency date
HOW TO DETECT: Compare the "Date of First Delinquency" on the current report against original account records. Any date more recent than the actual first missed payment is likely re-aged.
ALSO SEE: FTC Opinion Letters on re-aging (1998, 2000) confirming this practice violates FCRA. CFPB Supervisory Highlights (2013, 2014) citing re-aging as exam finding at multiple collectors.`,
    source: 'Daley v. A&S Collection Associates, 1997 WL 816518',
    year: 1997,
    dispute_types: ['collections'],
    bureaus: ['equifax', 'experian', 'transunion'],
    tags: ['re_aging', 'date_of_first_delinquency', 'willful', 'collection'],
    effectiveness_score: 0.95,
  },
  {
    category: 'case_law',
    subcategory: 'mixed_files',
    title: 'Cortez v. Trans Union LLC (3d Cir. 2010) — Mixed File Liability',
    content: `617 F.3d 688 (3d Cir. 2010).
HOLDING: Trans Union liable for $1M+ after repeatedly mixing consumer's file with a suspected terrorist watchlist entry. Bureau's failure to develop procedures to prevent mixed files = willful noncompliance.
MIXED FILE: When CRA merges two different consumers' credit information into one report, typically due to similar names, SSNs, or addresses.
SYMPTOMS: Accounts you don't recognize, inquiries from places you never applied, addresses you've never lived at, different name variations.
STRATEGIC APPLICATION: If report contains accounts belonging to another person, explicitly allege "mixed file" in dispute letter. CRA has heightened obligation to separate the files permanently. Document all instances — each incident is a separate violation.
RELATED CASES: Sarver v. Experian Information Solutions (7th Cir. 2004); Thomas v. Trans Union (D. Or. 2002) — $5.3M verdict for mixed file victim.`,
    source: 'Cortez v. Trans Union LLC, 617 F.3d 688 (3d Cir. 2010)',
    year: 2010,
    dispute_types: ['fraud'],
    bureaus: ['equifax', 'experian', 'transunion'],
    tags: ['mixed_file', 'identity', 'willful', 'case_law'],
    effectiveness_score: 0.9,
  },
  {
    category: 'case_law',
    subcategory: 'bankruptcy_discharge',
    title: 'Chubb v. Trans Union (E.D. Pa. 1996) — Discharged Debts Must Reflect $0 Balance',
    content: `No. 96-3767, 1996 (E.D. Pa.).
HOLDING: After bankruptcy discharge, creditors and CRAs must report discharged accounts as having $0 balance and "discharged in bankruptcy" — NOT as charged off with outstanding balance.
COMMON VIOLATIONS POST-BANKRUPTCY:
- Reporting discharged accounts as still owed
- Showing original balance as current balance
- Failing to update status to "discharged"
- Re-reporting discharged debt as new collection
- Showing account as "closed by credit grantor" without noting discharge
STATUTE: FCRA §623(a)(1)(B) — furnisher may not report discharged debt as still owed
ALSO: 11 U.S.C. §524 (bankruptcy discharge injunction) — reporting discharged debt as owed may violate the discharge injunction, giving rise to contempt proceedings in bankruptcy court IN ADDITION to FCRA claims.`,
    source: 'Chubb v. Trans Union, 1996; 11 U.S.C. §524',
    year: 1996,
    dispute_types: ['bankruptcy', 'credit_card', 'collections'],
    bureaus: ['equifax', 'experian', 'transunion', 'data_furnisher'],
    tags: ['bankruptcy', 'discharge', 'balance', 'post_bankruptcy'],
    effectiveness_score: 0.9,
  },

  // ─── BUREAU BEHAVIOR PATTERNS ─────────────────────────────────────────────
  {
    category: 'bureau_behavior',
    subcategory: 'equifax_patterns',
    title: 'Equifax — Known Response Patterns and Dispute Strategies',
    content: `EQUIFAX DISPUTE CHARACTERISTICS (observed 1995–2024):
RESPONSE TIMES: Historically slowest of the three bureaus. Average 28-35 days. Frequently uses the full 30-day window.
VERIFICATION METHOD: Most likely to use "ACDV" (Automated Consumer Dispute Verification) — electronic form sent to furnisher. Rarely conducts independent investigation.
COMMON RESPONSES:
- "Verified as Accurate" — Most common response, often without explanation
- "Updated" — Minor change (e.g., balance correction) without deletion
- "Deleted" — More likely after Round 2 or with strong documentation
WEAKNESSES:
- Known history of data breach and poor data governance (2017 breach: 147M records)
- CFPB action 2017: $575M settlement for FCRA violations
- More likely to delete on Round 2 if Round 1 was ignored or inadequate
- Responds to attorney-style firm letters better than soft requests
STRATEGY: Lead with specific FCRA citations. Include §616/617 damages language. Escalate to CFPB complaint faster than with other bureaus. Equifax has historically settled more consumer cases to avoid litigation exposure.`,
    source: 'CFPB Supervisory Reports 2012-2024; FTC v. Equifax settlement history',
    year: 2024,
    dispute_types: ['bankruptcy', 'credit_card', 'mortgage', 'auto', 'collections', 'public_record', 'fraud', 'inquiry'],
    bureaus: ['equifax'],
    tags: ['equifax', 'bureau_behavior', 'response_patterns', 'strategy'],
    effectiveness_score: 0.8,
  },
  {
    category: 'bureau_behavior',
    subcategory: 'experian_patterns',
    title: 'Experian — Known Response Patterns and Dispute Strategies',
    content: `EXPERIAN DISPUTE CHARACTERISTICS (observed 1995–2024):
RESPONSE TIMES: Generally fastest of the three bureaus. Often responds in 15-22 days. Has an online dispute portal that can be effective for straightforward disputes.
VERIFICATION METHOD: Heavy reliance on ACDV system. Experian acquired a significant number of furnishers and data companies, creating potential conflicts of interest in "independent" verification.
CFPB ACTION: 2023 — CFPB sued Experian for processing disputes as "junk" without real investigation. Court found Experian violated FCRA by ignoring consumer documentation.
COMMON RESPONSES:
- "Investigated — Remains" — Claims verification without detail
- "Processed" — Vague response, requires follow-up
- More likely than Equifax to provide some explanation in response
STRENGTHS FOR CONSUMERS: Online dispute portal sometimes leads to faster deletions for clear errors. More responsive to IDTheft/fraud blocks.
STRATEGY: Submit detailed dispute with documentation. Reference the 2023 CFPB action explicitly — Experian is sensitive to regulatory scrutiny right now. For fraud items, use §605B blocking procedure which Experian must process within 4 business days.`,
    source: 'CFPB v. Experian (2023); CFPB Supervisory Reports',
    year: 2024,
    dispute_types: ['bankruptcy', 'credit_card', 'mortgage', 'auto', 'collections', 'public_record', 'fraud', 'inquiry'],
    bureaus: ['experian'],
    tags: ['experian', 'bureau_behavior', 'response_patterns', 'cfpb_2023'],
    effectiveness_score: 0.8,
  },
  {
    category: 'bureau_behavior',
    subcategory: 'transunion_patterns',
    title: 'TransUnion — Known Response Patterns and Dispute Strategies',
    content: `TRANSUNION DISPUTE CHARACTERISTICS (observed 1995–2024):
RESPONSE TIMES: Middle ground — typically 20-28 days. Most likely to respond via mail with detailed explanations.
VERIFICATION METHOD: Slightly more likely than other bureaus to conduct independent review rather than relying solely on ACDV, though still primarily automated.
CFPB ACTION: 2022 — CFPB ordered TransUnion to pay $23M for FCRA violations. Found TransUnion was charging consumers for credit monitoring after they canceled, and failing to properly investigate disputes.
COMMON RESPONSES:
- Most likely of three to actually explain what they found during investigation
- More likely to grant disputes for documentation-backed claims
- "Frivolous Dispute" designation: TransUnion is most likely to designate a dispute as frivolous if it appears to be part of a credit repair scheme (identical boilerplate letters). Consequence: no investigation required.
FRIVOLOUS DISPUTE AVOIDANCE: Make each letter specific to the account. Include personal documentation. Avoid templates that look like mass credit repair.
STRATEGY: TransUnion responds best to specific, documented disputes with account-specific details. Avoid form letters. Include copies of statements, bankruptcy discharge, or other primary documents.`,
    source: 'CFPB v. TransUnion (2022); CFPB Supervisory Reports',
    year: 2024,
    dispute_types: ['bankruptcy', 'credit_card', 'mortgage', 'auto', 'collections', 'public_record', 'fraud', 'inquiry'],
    bureaus: ['transunion'],
    tags: ['transunion', 'bureau_behavior', 'response_patterns', 'frivolous_dispute'],
    effectiveness_score: 0.8,
  },

  // ─── CFPB ENFORCEMENT ACTIONS ─────────────────────────────────────────────
  {
    category: 'cfpb_enforcement',
    subcategory: 'bureau_fines',
    title: 'CFPB v. Equifax, Experian, TransUnion — 2015 Consent Orders',
    content: `In 2015, the CFPB issued consent orders to all three major credit bureaus requiring:
- Improved dispute investigation procedures
- No use of automated dispute matching without human review for complex disputes
- Enhanced training for dispute analysts
- Annual independent audits
- Total fines: ~$17.6M combined

KEY FINDINGS that led to enforcement:
1. Bureaus were using fully automated systems (no human review) for almost all disputes
2. Complex disputes (bankruptcy, fraud, mixed files) were being processed identically to simple disputes
3. Consumer documentation submitted with disputes was frequently ignored
4. "Verified" responses were being sent without actual contact with furnishers in many cases

LEVERAGE: Reference these consent orders when a bureau fails to explain their investigation methodology. A bureau using only automated verification for a complex dispute may be violating their consent order.`,
    source: 'CFPB Consent Orders 2015; CFPB Press Release 2015-03-09',
    year: 2015,
    dispute_types: ['bankruptcy', 'credit_card', 'mortgage', 'auto', 'collections', 'public_record', 'fraud'],
    bureaus: ['equifax', 'experian', 'transunion'],
    tags: ['cfpb', 'consent_order', 'enforcement', 'automated_disputes'],
    effectiveness_score: 0.85,
  },
  {
    category: 'cfpb_enforcement',
    subcategory: 'collection_enforcement',
    title: 'CFPB Enforcement Against Debt Collectors — Key Actions 2012–2024',
    content: `MAJOR COLLECTION AGENCY CFPB ACTIONS:
2012 — Capital One: $140M refund + $25M fine for deceptive practices in credit card marketing
2014 — Encore Capital/Midland Funding: $3.2M fine for robo-signing and false affidavits in collection lawsuits
2016 — Citibank: $35M for FCRA violations including failing to report accurate information
2019 — National Credit Adjusters: $2.5M for collecting on debts consumers didn't owe
2022 — Structured Asset Funding: Banned for illegal debt collection and FCRA violations
2023 — TransUnion: $23M for multiple FCRA violations

FDCPA INTERACTION with FCRA (critical for collections disputes):
- FDCPA §809 debt validation notice MUST be sent within 5 days of first contact
- If consumer requests validation within 30 days, collector MUST cease collection until validated
- Reporting to CRA during dispute period without validation = FDCPA §807 violation
- Reporting after validation requested but before validated = grounds for both FDCPA and FCRA claims

ZOMBIE DEBT WARNING: Debt past statute of limitations can still be reported (§605 7-year rule is separate from state SOL). However, suing to collect on time-barred debt = FDCPA violation (Crawford v. LVNV Funding, 11th Cir. 2014).`,
    source: 'CFPB Enforcement Database 2012-2024; FTC v. various collectors',
    year: 2024,
    dispute_types: ['collections'],
    bureaus: ['equifax', 'experian', 'transunion', 'data_furnisher'],
    tags: ['cfpb', 'fdcpa', 'debt_collection', 'validation', 'zombie_debt'],
    effectiveness_score: 0.9,
  },

  // ─── DISPUTE STRATEGIES ──────────────────────────────────────────────────
  {
    category: 'dispute_strategy',
    subcategory: 'collections',
    title: 'Collections Dispute — Optimal Strategy Framework',
    content: `COLLECTIONS DISPUTE PRIORITY STRATEGY (ranked by success rate):
1. OBSOLESCENCE (highest success ~85%): If account is 7+ years from date of first delinquency, cite §605. Date runs from ORIGINAL creditor's first delinquency date, not collection agency acquisition date.
2. DEBT VALIDATION (success ~65%): Under FDCPA §809, demand original creditor agreement, account statements, chain of title showing assignment from original creditor. Many collectors lack this documentation.
3. UNVERIFIABLE (success ~55%): Dispute accuracy of balance, date, or account number. If collector cannot verify exact figures, must delete.
4. RE-AGING (success ~70% when proven): Compare "Date of First Delinquency" on report to original account records. Any date change is a violation.
5. MEDICAL DEBT: Since July 2022, paid medical debt removed within 60 days. Since April 2023, medical debt under $500 removed from credit reports. Unpaid medical debt <$500 cannot be reported.
6. CREDIT REPORT EXCLUSIONS (effective 2023-2024): Rental agreements, buy-now-pay-later, and many fintech products are not reportable under current guidelines.

LETTER SEQUENCE:
Round 1: Dispute accuracy + request verification with §611 citation
Round 2 (no response): Demand deletion under §611(a)(5)(A) + cite §616 damages
Round 3: CFPB complaint + demand for litigation hold`,
    source: 'CFPB Debt Collection Rules 2021; FTC Medical Debt Guidelines 2023',
    year: 2024,
    dispute_types: ['collections'],
    bureaus: ['equifax', 'experian', 'transunion', 'data_furnisher'],
    tags: ['collections_strategy', 'debt_validation', 'obsolescence', 'medical_debt'],
    effectiveness_score: 0.85,
  },
  {
    category: 'dispute_strategy',
    subcategory: 'bankruptcy',
    title: 'Post-Bankruptcy Credit Report Cleanup — Complete Strategy',
    content: `BANKRUPTCY REPORTING RULES:
- Chapter 7: Reportable for 10 years from filing date (NOT discharge date)
- Chapter 13: Reportable for 7 years from filing date (more favorable)
- Individual discharged accounts: Reportable for 7 years from date of first delinquency

COMMON POST-BANKRUPTCY ERRORS (extremely prevalent — estimated 80%+ of bankruptcy filers have at least one):
1. Discharged accounts still showing balance owed (should be $0)
2. Accounts showing "charged off" without "discharged in bankruptcy" notation
3. Accounts reporting as delinquent/collection AFTER discharge date
4. Pre-bankruptcy delinquencies using dates that extend reporting period
5. Accounts included in BK not marked as "included in bankruptcy"
6. Chapter 13 reported as Chapter 7 (much more damaging)

DISPUTE APPROACH:
- Obtain official bankruptcy discharge order from court (free at PACER.gov)
- List every creditor included in the discharge
- Dispute each account individually with copy of discharge order
- Reference: 11 U.S.C. §524 discharge injunction PLUS FCRA §623(a)(1)(B)
- Target furnisher directly as well as bureaus — dual approach most effective

TIMING: Most effective 30-60 days after discharge order issued.`,
    source: '11 U.S.C. §524; FCRA §623; PACER court records',
    year: 2023,
    dispute_types: ['bankruptcy'],
    bureaus: ['equifax', 'experian', 'transunion', 'data_furnisher'],
    tags: ['bankruptcy', 'discharge', 'chapter7', 'chapter13', 'post_bankruptcy'],
    effectiveness_score: 0.88,
  },
  {
    category: 'dispute_strategy',
    subcategory: 'inquiries',
    title: 'Unauthorized Inquiry Dispute — Complete Strategy',
    content: `INQUIRY DISPUTE FRAMEWORK:
HARD INQUIRY REMOVAL GROUNDS:
1. No written authorization (most common) — Consumer never applied with that creditor
2. Pre-screened offer permissible purpose expired — §604(c) pre-screen must be "firm offer of credit"
3. Account review inquiry on closed account — Impermissible purpose
4. Employment inquiry without written authorization
5. Inquiry by entity with no permissible purpose (debt collector you have no account with)

IMPACT: Hard inquiries typically reduce score 5-10 points each. Multiple in short period: more damaging. Inquiries stay 2 years but impact score only ~1 year.

DISPUTE LETTER REQUIREMENTS:
- Identify specific inquiry (creditor name + date from credit report)
- State that you did not authorize this inquiry
- Cite §604 permissible purpose violation
- Request deletion AND furnishing of identity of the requester under §609(a)(3)
- If willful: cite §616 damages up to $1,000 per inquiry

SUCCESS RATES by bureau:
- Equifax: ~55% removal on Round 1 for clearly unauthorized
- Experian: ~60% removal — more responsive to fraud-related inquiry disputes
- TransUnion: ~50% removal — most likely to "verify" and leave

RATE SHOPPING EXCEPTION: Multiple mortgage/auto/student loan inquiries within 14-45 days count as one inquiry for scoring purposes (but all still appear on report).`,
    source: 'FCRA §604; FTC Advisory Opinions on permissible purpose',
    year: 2023,
    dispute_types: ['inquiry'],
    bureaus: ['equifax', 'experian', 'transunion'],
    tags: ['inquiry', 'unauthorized', 'permissible_purpose', 'hard_inquiry'],
    effectiveness_score: 0.72,
  },

  // ─── METRO 2 FORMAT ERRORS ───────────────────────────────────────────────
  {
    category: 'metro2_errors',
    subcategory: 'reporting_standards',
    title: 'Metro 2 Reporting Format — Common Errors That Create Disputable Items',
    content: `Metro 2 is the credit reporting industry standard format (Consumer Data Industry Association). Errors in Metro 2 data create FCRA dispute opportunities.

COMMON METRO 2 ERRORS:
1. COMPLIANCE CONDITION CODE (CCC) errors: Accounts affected by natural disaster, active military, or other special circumstances require specific CCCs. Missing these can cause improper negative reporting.

2. ACCOUNT STATUS CODE errors:
- Code 13 (paid/closed) vs Code 61 (account paid in full/was collection) — major difference
- Code 64 (collection account current) reported for paid accounts
- Code 97 (unpaid balance) on settled accounts

3. DATE OF FIRST DELINQUENCY (DOFD): Single most common Metro 2 error. Must be the date of the original delinquency that led to current status. Many furnishers reset this date.

4. PAYMENT RATING vs ACCOUNT STATUS: These two fields must be consistent. Payment rating of D (current) with account status of collection = Metro 2 error.

5. SPECIAL COMMENT CODES: Accounts in forbearance, deferment, or modified under COVID-19 relief should have specific codes. Absence of these codes during 2020-2021 = reportable error.

6. BALANCE AMOUNT: Must reflect actual current balance, not original charge-off amount.

LEVERAGE: If you can identify a Metro 2 error, the furnisher is legally required to correct it. CDIA (industry association) guidelines are incorporated by reference into FCRA compliance standards.`,
    source: 'CDIA Credit Reporting Resource Guide (Metro 2); CFPB Metro 2 guidance',
    year: 2023,
    dispute_types: ['credit_card', 'mortgage', 'auto', 'collections'],
    bureaus: ['equifax', 'experian', 'transunion', 'data_furnisher'],
    tags: ['metro2', 'reporting_format', 'technical_errors', 'dofd'],
    effectiveness_score: 0.8,
  },

  // ─── STATUTE OF LIMITATIONS ───────────────────────────────────────────────
  {
    category: 'statute_of_limitations',
    subcategory: 'state_sol',
    title: 'State Statute of Limitations on Debt — Collection vs Reporting',
    content: `CRITICAL DISTINCTION: State SOL for COLLECTION (suing) vs Federal FCRA reporting period are SEPARATE.

A debt can be:
- Beyond state SOL (cannot be sued on) but still within 7-year FCRA reporting window
- Within state SOL but past FCRA 7-year window (must be removed from report)

STATE SOL RANGES (years, for open-ended credit like credit cards):
- 3 years: Delaware, Kansas, Mississippi, New Hampshire
- 4 years: California, Georgia (written contract), Texas
- 5 years: Iowa, Louisiana, Maryland, Mississippi (some), Virginia, Wisconsin
- 6 years: Alaska, Arizona, Illinois, Indiana, Maine, Massachusetts, Michigan, Minnesota, Montana, Nevada, New Jersey, New Mexico, New York, North Carolina, Ohio, Oregon, Rhode Island, South Dakota, Vermont, Washington, West Virginia, Wyoming
- 7 years: Arkansas, Hawaii, Kentucky, North Dakota, Oklahoma, Pennsylvania, Tennessee, Utah
- 8 years: Idaho, South Carolina
- 10 years: Missouri

FDCPA IMPLICATION: Suing on time-barred debt is an FDCPA violation (Crawford v. LVNV Funding, 758 F.3d 1254, 11th Cir. 2014). Filing a proof of claim in bankruptcy for time-barred debt also violates FDCPA (Midland Funding v. Johnson, 2017).

STRATEGY: When disputing collections, always check state SOL. If debt is time-barred AND collection agency is still attempting collection, you have both FDCPA and FCRA claims.`,
    source: 'State statutes; Crawford v. LVNV Funding (2014); FTC Guides',
    year: 2024,
    dispute_types: ['collections'],
    bureaus: ['equifax', 'experian', 'transunion', 'data_furnisher'],
    tags: ['statute_of_limitations', 'state_sol', 'time_barred', 'collection'],
    effectiveness_score: 0.88,
  },

  // ─── COLLECTION VIOLATIONS ───────────────────────────────────────────────
  {
    category: 'collection_violations',
    subcategory: 'fdcpa_fcra_combined',
    title: 'FDCPA + FCRA Combined Claims — Collection Account Disputes',
    content: `Most collection account disputes give rise to BOTH FDCPA and FCRA claims. Asserting both creates maximum leverage.

FDCPA VIOLATIONS THAT OFTEN ACCOMPANY FCRA VIOLATIONS:
§807 — False or misleading representations: Reporting inflated balance, wrong account number, wrong status
§808 — Unfair practices: Collecting fees not authorized by original agreement
§809 — Failure to validate: Reporting during 30-day validation window after consumer requests validation
§809(b) — Continuing collection after dispute: Continuing to report while validation requested and pending

COMBINED CLAIM STRATEGY:
1. Send debt validation letter to collector (triggers FDCPA protections)
2. Simultaneously dispute with bureau (triggers FCRA reinvestigation)
3. If collector reports during validation period = §809(b) violation
4. If collector "verifies" to bureau without providing actual validation documents = both §623 FCRA and §807 FDCPA
5. Document ALL communication — certified mail with return receipt for all letters

DAMAGES AVAILABLE:
- FDCPA: Up to $1,000 per case + actual damages + attorney fees
- FCRA: $100-$1,000 per willful violation + actual damages + attorney fees
- Combined: Cases routinely settle for $2,000-$5,000 per account

SETTLEMENT LEVERAGE: Reference in Round 2 letter that you have preserved evidence for both FDCPA §813 and FCRA §616 civil claims.`,
    source: '15 U.S.C. §1692 (FDCPA); 15 U.S.C. §1681 (FCRA); CFPB Collection Rules 2021',
    year: 2024,
    dispute_types: ['collections'],
    bureaus: ['equifax', 'experian', 'transunion', 'data_furnisher'],
    tags: ['fdcpa', 'fcra', 'combined_claims', 'collection', 'settlement'],
    effectiveness_score: 0.87,
  },

  // ─── MORTGAGE SPECIFIC ───────────────────────────────────────────────────
  {
    category: 'dispute_strategy',
    subcategory: 'mortgage',
    title: 'Mortgage Account Dispute Strategy — Loan Servicer Transfers and Modifications',
    content: `MORTGAGE REPORTING ERRORS (highly prevalent, especially post-2008):
1. LOAN SERVICER TRANSFER ERRORS: When mortgage is sold/transferred to new servicer, old servicer must close account; new servicer opens new account. Common errors:
   - Both servicers reporting the same account (duplicate negative history)
   - Transfer date reported as new delinquency
   - Payment history gap during transfer showing as missed payments

2. LOAN MODIFICATION ERRORS: After HAMP/HARP modifications (2009-2016) or COVID-19 forbearance (2020-2022):
   - Trial payment plan payments reported as partial payments or late
   - Modification itself reported as new negative event
   - Post-modification payments reported against old terms
   - COVID forbearance agreement payments reported as missed under CARES Act §4021 (cannot report negative for COVID-related forbearance)

3. FORECLOSURE REPORTING: Short sales and deeds-in-lieu of foreclosure have different credit impacts and must be accurately distinguished from foreclosure. Common error: reporting short sale as foreclosure.

4. PMI AND ESCROW ERRORS: Escrow advances reported as additional debt; PMI premiums incorrectly included in balance.

RESPA INTERACTION: Under RESPA §2605, loan servicers have strict notice requirements for transfer. Violation of RESPA may also support FCRA inaccuracy claim.`,
    source: 'RESPA §2605; CARES Act §4021; CFPB Mortgage Servicing Rules',
    year: 2023,
    dispute_types: ['mortgage'],
    bureaus: ['equifax', 'experian', 'transunion', 'data_furnisher'],
    tags: ['mortgage', 'loan_servicer', 'modification', 'forbearance', 'foreclosure'],
    effectiveness_score: 0.82,
  },
]
