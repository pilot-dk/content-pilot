import { useMemo, useState } from 'react'
import { BarChart3 } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { weeklyPostedCounts } from '../../lib/streak'
import { Card } from '../ui/Card'

const CHART_HEIGHT = 120

export function ActivityChart() {
  const profile = useAppStore((s) => s.profile)
  const items = useAppStore((s) => s.items)
  const [hovered, setHovered] = useState<number | null>(null)

  const weeks = useMemo(() => (profile ? weeklyPostedCounts(items, 8, new Date()) : []), [items, profile])

  if (!profile) return null

  const goal = profile.weeklyUploadGoal
  const maxCount = Math.max(goal, ...weeks.map((w) => w.count), 1)
  // Round the axis ceiling to a clean step above the tallest bar/goal line.
  const axisMax = Math.ceil(maxCount / 2) * 2 || 2
  const goalPct = (goal / axisMax) * 100

  return (
    <Card padding="lg">
      <div className="flex items-center gap-2">
        <BarChart3 size={16} className="text-[var(--brand)]" />
        <h3 className="text-sm font-semibold text-[var(--text)]">Videos posted per week</h3>
      </div>

      <div className="relative mt-6" style={{ height: CHART_HEIGHT }}>
        {/* goal reference line */}
        <div
          className="absolute left-0 right-0 border-t border-dashed border-[var(--text-faint)]"
          style={{ bottom: `${goalPct}%` }}
        >
          <span className="absolute -top-4 right-0 text-[10px] font-medium text-[var(--text-faint)]">
            Goal · {goal}/wk
          </span>
        </div>

        <div className="flex h-full items-end gap-2">
          {weeks.map((w, i) => {
            const pct = Math.max((w.count / axisMax) * 100, w.count > 0 ? 6 : 0)
            const met = w.count >= goal
            return (
              <div
                key={w.weekStart}
                className="relative flex flex-1 flex-col items-center justify-end"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              >
                {hovered === i && (
                  <div className="absolute -top-8 z-10 whitespace-nowrap rounded-lg bg-[var(--text)] px-2 py-1 text-[11px] font-medium text-[var(--bg)]">
                    {w.count} posted · week of {w.label}
                  </div>
                )}
                <div
                  className="w-full max-w-[22px] rounded-t-[4px] transition-all"
                  style={{
                    height: `${pct}%`,
                    backgroundColor: met ? 'var(--brand)' : 'var(--bg-subtle)',
                    border: met ? 'none' : '1px solid var(--border)',
                  }}
                />
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-2 flex gap-2">
        {weeks.map((w) => (
          <span key={w.weekStart} className="flex-1 text-center text-[10px] text-[var(--text-faint)]">
            {w.label}
          </span>
        ))}
      </div>
    </Card>
  )
}
