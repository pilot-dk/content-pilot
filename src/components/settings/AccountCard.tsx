import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CheckCircle2, CloudOff, Crown, LogOut, Mail } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import { isCloudConfigured } from '../../lib/supabase'
import { startCheckout, openBillingPortal } from '../../lib/billing'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { AuthModal } from '../auth/AuthModal'

export function AccountCard() {
  const user = useAuthStore((s) => s.user)
  const isPro = useAuthStore((s) => s.isPro)
  const subscriptionStatus = useAuthStore((s) => s.subscriptionStatus)
  const signOut = useAuthStore((s) => s.signOut)
  const refreshSubscription = useAuthStore((s) => s.refreshSubscription)

  const [showAuth, setShowAuth] = useState(false)
  const [billingLoading, setBillingLoading] = useState(false)
  const [billingError, setBillingError] = useState<string | null>(null)
  const [searchParams, setSearchParams] = useSearchParams()

  const checkoutState = searchParams.get('checkout')

  // Coming back from Stripe: poll briefly for the webhook to land, then clear the query param.
  useEffect(() => {
    if (checkoutState !== 'success') return
    let attempts = 0
    const interval = setInterval(() => {
      attempts += 1
      refreshSubscription()
      if (attempts >= 5) clearInterval(interval)
    }, 1500)
    return () => clearInterval(interval)
  }, [checkoutState, refreshSubscription])

  const clearCheckoutParam = () => {
    const next = new URLSearchParams(searchParams)
    next.delete('checkout')
    setSearchParams(next, { replace: true })
  }

  if (!isCloudConfigured) {
    return (
      <Card padding="lg" className="opacity-80">
        <div className="flex items-center gap-2 text-[var(--text-muted)]">
          <CloudOff size={16} />
          <h3 className="text-sm font-semibold text-[var(--text)]">Account & Pro</h3>
        </div>
        <p className="mt-2 text-xs text-[var(--text-muted)]">
          Cloud sync and Pro billing aren't configured on this deployment yet. Everything still works locally in this
          browser.
        </p>
      </Card>
    )
  }

  const upgrade = async () => {
    setBillingError(null)
    setBillingLoading(true)
    const { error } = await startCheckout()
    if (error) setBillingError(error)
    setBillingLoading(false)
  }

  const manage = async () => {
    setBillingError(null)
    setBillingLoading(true)
    const { error } = await openBillingPortal()
    if (error) setBillingError(error)
    setBillingLoading(false)
  }

  return (
    <Card padding="lg">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--text)]">Account & Pro</h3>
        {isPro && <Badge tone="brand">Pro</Badge>}
        {user && !isPro && subscriptionStatus === 'past_due' && <Badge tone="danger">Payment issue</Badge>}
        {user && !isPro && subscriptionStatus === 'free' && <Badge tone="neutral">Free plan</Badge>}
      </div>

      {checkoutState === 'success' && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-[var(--success-soft)] px-3 py-2 text-xs text-[var(--success)]">
          <CheckCircle2 size={14} />
          {isPro ? 'You are on Pro — cloud sync is active.' : 'Payment received, confirming your subscription…'}
          <button onClick={clearCheckoutParam} className="ml-auto underline">
            Dismiss
          </button>
        </div>
      )}
      {checkoutState === 'cancelled' && (
        <div className="mt-3 flex items-center justify-between rounded-lg bg-[var(--bg-subtle)] px-3 py-2 text-xs text-[var(--text-muted)]">
          Checkout cancelled — no charge was made.
          <button onClick={clearCheckoutParam} className="underline">
            Dismiss
          </button>
        </div>
      )}

      {!user ? (
        <>
          <p className="mt-2 text-xs text-[var(--text-muted)]">
            Sign in to sync your schedule across devices, unlock unlimited content pillars, and export your calendar.
          </p>
          <div className="mt-4">
            <Button size="md" icon={<Mail size={14} />} onClick={() => setShowAuth(true)}>
              Sign in
            </Button>
          </div>
        </>
      ) : (
        <>
          <p className="mt-2 text-xs text-[var(--text-muted)]">Signed in as {user.email}</p>
          {billingError && <p className="mt-2 text-xs text-[var(--danger)]">{billingError}</p>}
          <div className="mt-4 flex flex-wrap gap-2">
            {isPro ? (
              <Button size="md" icon={<Crown size={14} />} variant="secondary" onClick={manage} disabled={billingLoading}>
                {billingLoading ? 'Opening…' : 'Manage billing'}
              </Button>
            ) : (
              <Button size="md" icon={<Crown size={14} />} onClick={upgrade} disabled={billingLoading}>
                {billingLoading ? 'Redirecting…' : 'Upgrade to Pro — $7/mo'}
              </Button>
            )}
            <Button size="md" variant="ghost" icon={<LogOut size={14} />} onClick={signOut}>
              Sign out
            </Button>
          </div>
        </>
      )}

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </Card>
  )
}
