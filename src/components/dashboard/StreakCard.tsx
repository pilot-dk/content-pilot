import { useMemo } from 'react'
import { Flame } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { computeStreak } from '../../lib/streak'
import { Card } from '../ui/Card'
import { ProgressBar } from '../ui/ProgressBar'

export function StreakCard() {
  const profile = useAppStore((s) => s.profile)
  const items = useAppStore((s) => s.items)
  const today = useMemo(() => new Date(), [])
  const streak = useMemo(
    () => (profile ? computeStreak(items, profile.weeklyUploadGoal, today) : null),
    [items, profile, today],
  )

  if (!profile || !streak) return null

  return (
    <Card padding="lg">
      <div className="flex items-center gap-2 text-[var(--warning)]">
        <Flame size={16} className={streak.currentStreakWeeks > 0 ? '' : 'opacity-40'} />
        <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">Consistency streak</span>
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-3xl font-semibold text-[var(--text)]">{streak.currentStreakWeeks}</span>
        <span className="text-sm text-[var(--text-muted)]">week{streak.currentStreakWeeks === 1 ? '' : 's'} in a row</span>
      </div>
      <p className="mt-1 text-xs text-[var(--text-faint)]">Best streak: {streak.longestStreakWeeks} week{streak.longestStreakWeeks === 1 ? '' : 's'}</p>

      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="text-[var(--text-muted)]">This week</span>
          <span className="font-medium text-[var(--text)]">
            {streak.thisWeekPosted} / {streak.thisWeekGoal} posted
          </span>
        </div>
        <ProgressBar
          pct={(streak.thisWeekPosted / streak.thisWeekGoal) * 100}
          color={streak.thisWeekComplete ? 'var(--success)' : 'var(--brand)'}
        />
      </div>
      {streak.thisWeekComplete && (
        <p className="mt-3 text-xs font-medium text-[var(--success)]">Goal hit for this week 🎉 keep it going.</p>
      )}
    </Card>
  )
}
