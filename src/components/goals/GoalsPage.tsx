import { useMemo, useState } from 'react'
import { Plus, Trophy } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { goalProgress } from '../../lib/goals'
import type { Goal, GoalPeriod } from '../../types'
import { Topbar } from '../layout/Topbar'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { ProgressBar } from '../ui/ProgressBar'
import { GoalModal } from './GoalModal'

export function GoalsPage() {
  const goals = useAppStore((s) => s.goals)
  const items = useAppStore((s) => s.items)
  const [tab, setTab] = useState<GoalPeriod>('monthly')
  const [modalState, setModalState] = useState<{ mode: 'closed' } | { mode: 'create' } | { mode: 'edit'; goal: Goal }>({
    mode: 'closed',
  })

  const filtered = useMemo(() => goals.filter((g) => g.period === tab).sort((a, b) => b.periodKey.localeCompare(a.periodKey)), [
    goals,
    tab,
  ])

  return (
    <div>
      <Topbar title="Goals" subtitle="Set monthly and yearly targets and watch your progress add up." />

      <div className="p-5 md:p-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-1">
            {(['monthly', 'yearly'] as GoalPeriod[]).map((p) => (
              <button
                key={p}
                onClick={() => setTab(p)}
                className={`rounded-lg px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
                  tab === p ? 'bg-[var(--brand)] text-white' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <Button size="sm" icon={<Plus size={14} />} onClick={() => setModalState({ mode: 'create' })}>
            New goal
          </Button>
        </div>

        {filtered.length === 0 ? (
          <Card padding="lg">
            <p className="text-sm text-[var(--text-muted)]">No {tab} goals yet. Add one to start tracking progress.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((goal) => {
              const progress = goalProgress(goal, items)
              const complete = progress.pct >= 100
              return (
                <button key={goal.id} onClick={() => setModalState({ mode: 'edit', goal })} className="text-left">
                  <Card padding="lg" className="h-full transition-transform hover:-translate-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium uppercase tracking-wide text-[var(--text-faint)]">
                        {goal.periodKey}
                      </span>
                      {complete && <Trophy size={15} className="text-[var(--warning)]" />}
                    </div>
                    <h3 className="mt-1.5 text-sm font-semibold text-[var(--text)]">{goal.label}</h3>
                    <p className="mt-2 text-2xl font-semibold text-[var(--text)]">
                      {progress.current}
                      <span className="text-sm font-normal text-[var(--text-muted)]"> / {progress.target} {goal.unit}</span>
                    </p>
                    <div className="mt-3">
                      <ProgressBar pct={progress.pct} color={complete ? 'var(--success)' : 'var(--brand)'} />
                    </div>
                    <p className="mt-2 text-xs text-[var(--text-faint)]">{progress.pct}% complete</p>
                  </Card>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {modalState.mode === 'create' && <GoalModal onClose={() => setModalState({ mode: 'closed' })} defaultPeriod={tab} />}
      {modalState.mode === 'edit' && (
        <GoalModal onClose={() => setModalState({ mode: 'closed' })} existing={modalState.goal} defaultPeriod={tab} />
      )}
    </div>
  )
}
