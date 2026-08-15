import { supabase } from './supabase'
import type { AppSnapshot } from '../types'

export async function pullCloudSnapshot(userId: string): Promise<AppSnapshot | null> {
  if (!supabase) return null
  const { data, error } = await supabase.from('cloud_snapshots').select('data').eq('user_id', userId).maybeSingle()
  if (error || !data) return null
  return data.data as AppSnapshot
}

export async function pushCloudSnapshot(userId: string, snapshot: AppSnapshot): Promise<{ error: string | null }> {
  if (!supabase) return { error: 'Cloud sync is not configured.' }
  const { error } = await supabase.from('cloud_snapshots').upsert({ user_id: userId, data: snapshot })
  return { error: error?.message ?? null }
}
