import { createServiceClient } from '@/lib/supabase/server'

export type PlanTier = 'free' | 'basic' | 'pro' | 'partner'

export interface UserPlan {
  plan: PlanTier
  status: string
  maxCases: number
  maxItems: number
  triBureau: boolean
  escalation: boolean
  partnerDashboard: boolean
  isActive: boolean
}

export async function getUserPlan(userId: string): Promise<UserPlan> {
  const supabase = createServiceClient()

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('plan, status')
    .eq('user_id', userId)
    .single()

  const plan = (sub?.plan ?? 'free') as PlanTier
  const status = sub?.status ?? 'active'
  const isActive = status === 'active' || status === 'trialing'

  const { data: limits } = await supabase
    .from('plan_limits')
    .select('*')
    .eq('plan', isActive ? plan : 'free')
    .single()

  return {
    plan: isActive ? plan : 'free',
    status,
    maxCases: limits?.max_cases ?? 1,
    maxItems: limits?.max_items_per_case ?? 3,
    triBureau: limits?.tri_bureau ?? false,
    escalation: limits?.escalation_bot ?? false,
    partnerDashboard: limits?.partner_dashboard ?? false,
    isActive,
  }
}

export async function assertPlanLimit(
  userId: string,
  check: 'cases' | 'triBureau' | 'escalation' | 'partnerDashboard'
): Promise<{ allowed: boolean; reason?: string; upgradeTo?: PlanTier }> {
  const plan = await getUserPlan(userId)

  if (check === 'cases') {
    const supabase = createServiceClient()
    const { count } = await supabase
      .from('cases')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .not('status', 'eq', 'completed')

    if ((count ?? 0) >= plan.maxCases) {
      return {
        allowed: false,
        reason: `Your ${plan.plan} plan allows ${plan.maxCases} active case${plan.maxCases === 1 ? '' : 's'}.`,
        upgradeTo: plan.plan === 'free' ? 'basic' : plan.plan === 'basic' ? 'pro' : undefined,
      }
    }
  }

  if (check === 'triBureau' && !plan.triBureau) {
    return { allowed: false, reason: 'Tri-bureau dispatch requires Pro or Partner.', upgradeTo: 'pro' }
  }

  if (check === 'escalation' && !plan.escalation) {
    return { allowed: false, reason: 'Escalation Bot requires Pro or Partner.', upgradeTo: 'pro' }
  }

  if (check === 'partnerDashboard' && !plan.partnerDashboard) {
    return { allowed: false, reason: 'Partner dashboard requires a Partner plan.', upgradeTo: 'partner' }
  }

  return { allowed: true }
}
