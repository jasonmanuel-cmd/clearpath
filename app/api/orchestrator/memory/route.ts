import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// GET /api/orchestrator/memory — inspect what the orchestrator has learned
export async function GET(req: NextRequest) {
  try {
    const supabase = createServiceClient()
    const { searchParams } = new URL(req.url)
    const disputeType = searchParams.get('type')
    const bureau = searchParams.get('bureau')
    const minSamples = parseInt(searchParams.get('min_samples') ?? '1')

    let query = supabase
      .from('orchestrator_memory')
      .select('*')
      .gte('sample_count', minSamples)
      .order('confidence_score', { ascending: false })
      .order('sample_count', { ascending: false })
      .limit(50)

    if (disputeType) query = query.eq('dispute_type', disputeType)
    if (bureau) query = query.eq('bureau', bureau)

    const { data, error } = await query

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Also return a summary of overall stats
    const { data: stats } = await supabase
      .from('orchestrator_memory')
      .select('outcome, success_rate, sample_count, dispute_type')

    type StatRow = { outcome: string; success_rate: number | null; sample_count: number | null; dispute_type: string }
    type TypeSummary = { samples: number; avgSuccess: number }

    const totalSamples = (stats as StatRow[] ?? []).reduce((acc: number, s: StatRow) => acc + (s.sample_count ?? 0), 0)
    const overallSuccessRate = stats && stats.length > 0
      ? (stats as StatRow[]).reduce((acc: number, s: StatRow) => acc + ((s.success_rate ?? 0) * (s.sample_count ?? 1)), 0) / (totalSamples || 1)
      : 0

    const byType = (stats as StatRow[] ?? []).reduce<Record<string, TypeSummary>>((acc: Record<string, TypeSummary>, s: StatRow) => {
      if (!acc[s.dispute_type]) acc[s.dispute_type] = { samples: 0, avgSuccess: 0 }
      acc[s.dispute_type].samples += s.sample_count ?? 1
      acc[s.dispute_type].avgSuccess = (
        acc[s.dispute_type].avgSuccess * (acc[s.dispute_type].samples - (s.sample_count ?? 1)) +
        (s.success_rate ?? 0) * (s.sample_count ?? 1)
      ) / acc[s.dispute_type].samples
      return acc
    }, {})

    return NextResponse.json({
      memories: data,
      summary: {
        totalPatterns: data?.length ?? 0,
        totalSamples,
        overallSuccessRate: Math.round(overallSuccessRate * 100),
        byType,
      },
    })
  } catch (err) {
    console.error('Memory query error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
