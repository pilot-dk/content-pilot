import { useMemo } from 'react'
import { format, parseISO } from 'date-fns'
import { Clock3 } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { topUpcomingSlots } from '../../lib/recommendations'
import { Card } from '../ui/Card'

function tierFor(score: number): { label: string; color: string } {
  if (score >= 0.95) return { label: 'Excellent', color: 'var(--success)' }
  if (score >= 0.8) return { label: 'Great', color: 'var(--brand)' }
  if (score >= 0.6) return { label: 'Good', color: 'var(--warning)' }
  return { label: 'Okay', color: 'var(--text-faint)' }
}

export function BestTimesWidget() {
  const profile = useAppStore((s) => s.profile)
  const today = useMemo(() => new Date(), [])
  const slots = useMemo(
    () => (profile ? topUpcomingSlots(profile.platform, profile.niche, today, 7, 6) : []),
    [profile, today],
  )

  if (!profile) return null

  return (
    <Card padding="lg">
      <div className="flex items-center gap-2">
        <Clock3 size={16} className="text-[var(--brand)]" />
        <h3 className="text-sm font-semibold text-[var(--text)]">Best times to post this week</h3>
      </div>
      <ul className="mt-4 space-y-3">
        {slots.map((slot, i) => {
          const tier = tierFor(slot.score)
          return (
            <li key={i} className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-[var(--text)]">
                  {format(parseISO(slot.date), 'EEE, MMM d')} · {slot.start}–{slot.end}
                </p>
                <p className="text-xs text-[var(--text-muted)]">{slot.reason}</p>
              </div>
              <span
                className="shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold"
                style={{ backgroundColor: `${tier.color}1a`, color: tier.color }}
              >
                {tier.label}
              </span>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
