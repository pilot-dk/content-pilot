import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { SubscriptionStatus } from '../types'

interface AuthUser {
  id: string
  email: string | null
}

interface AuthState {
  initialized: boolean
  user: AuthUser | null
  subscriptionStatus: SubscriptionStatus
  isPro: boolean
  authLoading: boolean // true while a magic-link send / sign-out is in flight

  init: () => void
  sendMagicLink: (email: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  refreshSubscription: () => Promise<void>
}

async function fetchSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
  if (!supabase) return 'free'
  const { data } = await supabase.from('subscriptions').select('status').eq('user_id', userId).maybeSingle()
  return (data?.status as SubscriptionStatus) ?? 'free'
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  initialized: false,
  user: null,
  subscriptionStatus: 'free',
  isPro: false,
  authLoading: false,

  init: () => {
    if (!supabase || get().initialized) return
    set({ initialized: true })

    supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ? { id: session.user.id, email: session.user.email ?? null } : null
      set({ user })
      if (user) {
        fetchSubscriptionStatus(user.id).then((status) => set({ subscriptionStatus: status, isPro: status === 'active' }))
      } else {
        set({ subscriptionStatus: 'free', isPro: false })
      }
    })
  },

  sendMagicLink: async (email) => {
    if (!supabase) return { error: 'Cloud sync is not configured yet.' }
    set({ authLoading: true })
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + window.location.pathname },
    })
    set({ authLoading: false })
    return { error: error?.message ?? null }
  },

  signOut: async () => {
    if (!supabase) return
    set({ authLoading: true })
    await supabase.auth.signOut()
    set({ authLoading: false, user: null, subscriptionStatus: 'free', isPro: false })
  },

  refreshSubscription: async () => {
    const user = get().user
    if (!user) return
    const status = await fetchSubscriptionStatus(user.id)
    set({ subscriptionStatus: status, isPro: status === 'active' })
  },
}))
