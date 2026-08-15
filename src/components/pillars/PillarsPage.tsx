import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { useAuthStore } from '../../store/useAuthStore'
import { isCloudConfigured } from '../../lib/supabase'
import { pillarStats } from '../../lib/rotation'
import { FREE_PILLAR_LIMIT, type ContentPillar } from '../../types'
import { Topbar } from '../layout/Topbar'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { UpsellModal } from '../ui/UpsellModal'
import { AuthModal } from '../auth/AuthModal'
import { useUpgradeFlow } from '../../hooks/useUpgradeFlow'
import { PillarModal } from './PillarModal'

export function PillarsPage() {
  const pillars = useAppStore((s) => s.pillars)
  const items = useAppStore((s) => s.items)
  const isPro = useAuthStore((s) => s.isPro)
  const [modalState, setModalState] = useState<
    { mode: 'closed' } | { mode: 'create' } | { mode: 'edit'; pillar: ContentPillar } | { mode: 'upsell' }
  >({ mode: 'closed' })

  const stats = useMemo(() => pillarStats(pillars, items, new Date()), [pillars, items])
  const atFreeLimit = isCloudConfigured && !isPro && pillars.length >= FREE_PILLAR_LIMIT
  const { upgrade, showAuth, closeAuth } = useUpgradeFlow()

  const openCreate = () => setModalState({ mode: atFreeLimit ? 'upsell' : 'create' })

  return (
    <div>
      <Topbar
        title="Content Pillars"
        subtitle={
          atFreeLimit
            ? `The rotation of content types ContentPilot suggests to keep you varied. Free plan is capped at ${FREE_PILLAR_LIMIT}.`
            : 'The rotation of content types ContentPilot suggests to keep you varied.'
        }
      />

      <div className="p-5 md:p-8">
        <div className="mb-4 flex justify-end">
          <Button size="sm" icon={<Plus size={14} />} onClick={openCreate}>
            New pillar
          </Button>
        </div>

        {stats.length === 0 ? (
          <Card padding="lg">
            <p className="text-sm text-[var(--text-muted)]">
              No content pillars yet. Add a few types of videos you make so ContentPilot can rotate ideas for you.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stats
              .slice()
              .sort((a, b) => b.pillar.weight - a.pillar.weight)
              .map(({ pillar, timesUsed, lastUsedDate }) => (
                <button key={pillar.id} onClick={() => setModalState({ mode: 'edit', pillar })} className="text-left">
                  <Card padding="lg" className="h-full transition-transform hover:-translate-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: pillar.color }} />
                      <span className="text-xs font-medium text-[var(--text-faint)]">Priority {pillar.weight}/5</span>
                    </div>
                    <h3 className="mt-2 text-sm font-semibold text-[var(--text)]">{pillar.name}</h3>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">{pillar.description || 'No description'}</p>
                    <div className="mt-3 flex items-center justify-between text-xs text-[var(--text-faint)]">
                      <span>Used {timesUsed}×</span>
                      <span>{lastUsedDate ? `Last: ${lastUsedDate}` : 'Never used'}</span>
                    </div>
                  </Card>
                </button>
              ))}
          </div>
        )}
      </div>

      {modalState.mode === 'create' && <PillarModal onClose={() => setModalState({ mode: 'closed' })} />}
      {modalState.mode === 'edit' && (
        <PillarModal onClose={() => setModalState({ mode: 'closed' })} existing={modalState.pillar} />
      )}
      {modalState.mode === 'upsell' && (
        <UpsellModal
          title="Free plan pillar limit reached"
          body={`The free plan is capped at ${FREE_PILLAR_LIMIT} content pillars. Upgrade to Pro for unlimited pillars, cloud sync, and calendar export.`}
          onClose={() => setModalState({ mode: 'closed' })}
          onUpgrade={upgrade}
        />
      )}
      {showAuth && <AuthModal onClose={closeAuth} />}
    </div>
  )
}
