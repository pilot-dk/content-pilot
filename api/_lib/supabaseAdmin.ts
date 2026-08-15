import { createClient, type User } from '@supabase/supabase-js'

// VITE_SUPABASE_URL is intentionally reused here — it's a public project URL
// (not a secret), the same one the client uses. The service role key below
// IS secret and must never be prefixed VITE_ / exposed to the client bundle.
export function getSupabaseAdmin() {
  const url = process.env.VITE_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) throw new Error('Supabase server credentials are not configured.')
  return createClient(url, serviceKey, { auth: { persistSession: false } })
}

export async function getUserFromAuthHeader(authHeader: string | string[] | undefined): Promise<User | null> {
  const header = Array.isArray(authHeader) ? authHeader[0] : authHeader
  if (!header?.startsWith('Bearer ')) return null
  const token = header.slice('Bearer '.length)
  const admin = getSupabaseAdmin()
  const { data, error } = await admin.auth.getUser(token)
  if (error || !data.user) return null
  return data.user
}
