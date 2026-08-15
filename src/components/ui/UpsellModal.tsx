import { Sparkles } from 'lucide-react'
import { Modal } from './Modal'
import { Button } from './Button'

export function UpsellModal({
  onClose,
  onUpgrade,
  title,
  body,
}: {
  onClose: () => void
  onUpgrade: () => void
  title: string
  body: string
}) {
  return (
    <Modal title={title} onClose={onClose}>
      <div className="text-center py-2">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)]">
          <Sparkles size={18} />
        </div>
        <p className="text-sm text-[var(--text-muted)]">{body}</p>
        <div className="mt-5 flex justify-center gap-2">
          <Button variant="secondary" size="md" onClick={onClose}>
            Not now
          </Button>
          <Button size="md" onClick={onUpgrade}>
            Upgrade to Pro
          </Button>
        </div>
      </div>
    </Modal>
  )
}
