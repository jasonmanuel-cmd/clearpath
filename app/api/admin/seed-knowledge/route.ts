import { NextResponse } from 'next/server'
import { seedKnowledgeBase } from '@/lib/knowledge/seeder'

export async function POST() {
  try {
    const result = await seedKnowledgeBase()
    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Seed failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
