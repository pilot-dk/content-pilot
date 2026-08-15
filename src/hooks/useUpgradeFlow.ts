import { useEffect, useRef, useState } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { startCheckout } from '../lib/billing'

/**
 * Encapsulates "upgrade to Pro" from anywhere in the app: if the visitor
 * isn't signed in yet, opens the sign-in modal first and automatically
 * continues to Stripe Checkout once they're authenticated.
 */
export function useUpgradeFlow() {
  const user = useAuthStore((s) => s.user)
  const [showAuth, setShowAuth] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const pendingRef = useRef(false)

  useEffect(() => {
    if (pendingRef.current && user) {
      pendingRef.current = false
      setShowAuth(false)
      startCheckout().then(({ error }) => {
        if (error) setError(error)
      })
    }
  }, [user])

  const upgrade = () => {
    setError(null)
    if (user) {
      startCheckout().then(({ error }) => {
        if (error) setError(error)
      })
    } else {
      pendingRef.current = true
      setShowAuth(true)
    }
  }

  const closeAuth = () => {
    pendingRef.current = false
    setShowAuth(false)
  }

  return { upgrade, showAuth, closeAuth, error }
}
