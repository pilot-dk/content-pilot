import { useState } from 'react'
import { Mail } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import { Modal } from '../ui/Modal'
import { Field, Input } from '../ui/Field'
import { Button } from '../ui/Button'

export function AuthModal({ onClose }: { onClose: () => void }) {
  const sendMagicLink = useAuthStore((s) => s.sendMagicLink)
  const authLoading = useAuthStore((s) => s.authLoading)
  const [email, setEmail] = useState('')
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const submit = async () => {
    setError(null)
    const trimmed = email.trim()
    if (!trimmed) return
    const { error } = await sendMagicLink(trimmed)
    if (error) {
      setError(error)
    } else {
      setSentTo(trimmed)
    }
  }

  return (
    <Modal title="Sign in to ContentPilot" onClose={onClose} width={420}>
      {sentTo ? (
        <div className="text-center py-2">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)]">
            <Mail size={18} />
          </div>
          <p className="text-sm font-medium text-[var(--text)]">Check your inbox</p>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            We sent a sign-in link to <span className="font-medium text-[var(--text)]">{sentTo}</span>. Click it to come
            back here signed in — no password needed.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-muted)]">
            We'll email you a one-click sign-in link — no password to create or remember.
          </p>
          <Field label="Email address">
            <Input
              autoFocus
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
            />
          </Field>
          {error && <p className="text-xs text-[var(--danger)]">{error}</p>}
          <Button size="md" fullWidth onClick={submit} disabled={!email.trim() || authLoading}>
            {authLoading ? 'Sending…' : 'Send magic link'}
          </Button>
        </div>
      )}
    </Modal>
  )
}
