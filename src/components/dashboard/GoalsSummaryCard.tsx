import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Target } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { currentPeriodKey, goalProgress } from '../../lib/goals'
import { Card } from '../ui/Card'
import { ProgressBar } from '../ui/ProgressBar'

export function GoalsSummaryCard() {
  const goals = useAppStore((s) => s.goals)
  const items = useAppStore((s) => s.items)
  const now = useMemo(() => new Date(), [])

  const monthly = goals.filter((g) => g.period === 'monthly' && g.periodKey === currentPeriodKey('monthly', now))
  const yearly = goals.filter((g) => g.period === 'yearly' && g.periodKey === currentPeriodKey('yearly', now))
  const featured = [...monthly, ...yearly].slice(0, 3)

  return (
    <Card padding="lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target size={16} className="text-[var(--brand)]" />
          <h3 className="text-sm font-semibold text-[var(--text)]">Goals this period</h3>
        </div>
        <Link to="/goals" className="text-xs font-medium text-[var(--brand)] hover:underline">
          View all
        </Link>
      </div>

      {featured.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--text-muted)]">No goals yet — add one to start tracking progress.</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {featured.map((g) => {
            const progress = goalProgress(g, items)
            return (
              <li key={g.id}>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="text-[var(--text-muted)]">
                    {g.period === 'monthly' ? 'Monthly' : 'Yearly'} · {g.label}
                  </span>
                  <span className="font-medium text-[var(--text)]">
                    {progress.current} / {progress.target} {g.unit}
                  </span>
                </div>
                <ProgressBar pct={progress.pct} color={progress.pct >= 100 ? 'var(--success)' : 'var(--brand)'} />
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}
