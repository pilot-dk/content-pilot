import { useEffect, useRef } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { useAppStore } from '../store/useAppStore'
import { pullCloudSnapshot, pushCloudSnapshot } from '../lib/cloudSync'
import type { AppSnapshot } from '../types'

function snapshotFromStore(): AppSnapshot {
  const s = useAppStore.getState()
  return { profile: s.profile, pillars: s.pillars, items: s.items, goals: s.goals, theme: s.theme }
}

/**
 * Keeps the local store in sync with Supabase for signed-in Pro users:
 * pulls (or seeds) the cloud snapshot once per sign-in, then debounce-pushes
 * local changes back up. No-ops entirely for anonymous / free users — they
 * keep the original localStorage-only behavior.
 */
export function useCloudSync() {
  const init = useAuthStore((s) => s.init)
  const user = useAuthStore((s) => s.user)
  const isPro = useAuthStore((s) => s.isPro)
  const hasSyncedRef = useRef(false)
  const applyingRemoteRef = useRef(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    init()
  }, [init])

  useEffect(() => {
    if (!user || !isPro) {
      hasSyncedRef.current = false
      return
    }
    if (hasSyncedRef.current) return
    hasSyncedRef.current = true

    let cancelled = false
    ;(async () => {
      const remote = await pullCloudSnapshot(user.id)
      if (cancelled) return
      applyingRemoteRef.current = true
      if (remote && remote.profile) {
        useAppStore.getState().loadSnapshot(remote)
      } else {
        await pushCloudSnapshot(user.id, snapshotFromStore())
      }
      applyingRemoteRef.current = false
    })()

    return () => {
      cancelled = true
    }
  }, [user, isPro])

  useEffect(() => {
    if (!user || !isPro) return
    const unsubscribe = useAppStore.subscribe(() => {
      if (applyingRemoteRef.current) return
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        pushCloudSnapshot(user.id, snapshotFromStore())
      }, 1500)
    })
    return () => {
      unsubscribe()
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [user, isPro])
}
