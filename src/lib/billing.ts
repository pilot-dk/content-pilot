import { supabase } from './supabase'

async function authedPost(path: string): Promise<{ url?: string; error?: string }> {
  if (!supabase) return { error: 'Cloud sync is not configured.' }
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) return { error: 'You need to be signed in first.' }

  const res = await fetch(path, {
    method: 'POST',
    headers: { Authorization: `Bearer ${session.access_token}` },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    return { error: body.error ?? `Request failed (${res.status})` }
  }
  return res.json()
}

/** Redirects to Stripe Checkout to start a Pro subscription. */
export async function startCheckout(): Promise<{ error: string | null }> {
  const { url, error } = await authedPost('/api/create-checkout-session')
  if (error) return { error }
  if (url) window.location.href = url
  return { error: null }
}

/** Redirects to the Stripe Customer Portal to manage/cancel an existing subscription. */
export async function openBillingPortal(): Promise<{ error: string | null }> {
  const { url, error } = await authedPost('/api/create-portal-session')
  if (error) return { error }
  if (url) window.location.href = url
  return { error: null }
}
