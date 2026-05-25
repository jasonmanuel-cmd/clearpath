import { NextRequest, NextResponse } from 'next/server'
import { seedKnowledgeBase } from '@/lib/knowledge/seeder'

export async function POST(req: NextRequest) {
  try {
    // Verify admin secret header (set ADMIN_SECRET in .env.local)
    const adminSecret = req.headers.get('x-admin-secret')
    if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await seedKnowledgeBase()
    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Seed failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
