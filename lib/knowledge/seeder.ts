import { createServiceClient } from '@/lib/supabase/server'
import { KNOWLEDGE_SEED } from './seed-data'

export async function seedKnowledgeBase(): Promise<{ inserted: number; skipped: number }> {
  const supabase = createServiceClient()

  const { count } = await supabase
    .from('dispute_knowledge_base')
    .select('*', { count: 'exact', head: true })

  if ((count ?? 0) > 0) {
    return { inserted: 0, skipped: KNOWLEDGE_SEED.length }
  }

  const { data, error } = await supabase
    .from('dispute_knowledge_base')
    .insert(KNOWLEDGE_SEED)
    .select()

  if (error) throw new Error(`Knowledge base seed failed: ${error.message}`)

  return { inserted: data?.length ?? 0, skipped: 0 }
}
