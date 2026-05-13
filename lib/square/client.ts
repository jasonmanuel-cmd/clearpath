import { SquareClient, SquareEnvironment } from 'square'

export const squareClient = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN!,
  environment:
    process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT === 'production'
      ? SquareEnvironment.Production
      : SquareEnvironment.Sandbox,
})

export const LOCATION_ID = process.env.SQUARE_LOCATION_ID!

export const PLAN_IDS = {
  basic:   process.env.SQUARE_PLAN_BASIC_ID!,
  pro:     process.env.SQUARE_PLAN_PRO_ID!,
  partner: process.env.SQUARE_PLAN_PARTNER_ID!,
} as const

export type PlanKey = keyof typeof PLAN_IDS

export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    priceLabel: '$0/mo',
    description: 'Try it out',
    features: [
      '1 case',
      'Up to 3 dispute items',
      'Single bureau',
      'AI letter generation',
    ],
    limit: { cases: 1, items: 3, triBureau: false, escalation: false },
    cta: 'Get started free',
    highlighted: false,
  },
  basic: {
    name: 'Basic',
    price: 4900,
    priceLabel: '$49/mo',
    description: 'For individuals',
    features: [
      '5 active cases',
      'Up to 15 dispute items',
      'Single bureau dispatch',
      'All 8 specialist agents',
      '30-day outcome tracking',
    ],
    limit: { cases: 5, items: 15, triBureau: false, escalation: false },
    cta: 'Start Basic',
    highlighted: false,
  },
  pro: {
    name: 'Pro',
    price: 9900,
    priceLabel: '$99/mo',
    description: 'Maximum firepower',
    features: [
      'Unlimited cases',
      'Unlimited dispute items',
      'Tri-bureau dispatch (all 3)',
      'Escalation Bot + CFPB filing',
      'Orchestrator learning memory',
      '30-year FCRA knowledge base',
    ],
    limit: { cases: 999, items: 999, triBureau: true, escalation: true },
    cta: 'Start Pro',
    highlighted: true,
  },
  partner: {
    name: 'Partner',
    price: 29900,
    priceLabel: '$299/mo',
    description: 'For credit repair agencies',
    features: [
      'Everything in Pro',
      'White-label partner dashboard',
      'Unlimited client accounts',
      'Client roster management',
      'Real-time status per client',
      'Priority support',
    ],
    limit: { cases: 999, items: 999, triBureau: true, escalation: true },
    cta: 'Start Partner',
    highlighted: false,
  },
} as const
