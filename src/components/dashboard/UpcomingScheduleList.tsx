import { useMemo } from 'react'
import { format, parseISO } from 'date-fns'
import { CalendarClock, Check } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import type { ScheduledItem } from '../../types'
import { Card } from '../ui/Card'
import { StatusBadge } from '../ui/StatusBadge'
import { Button } from '../ui/Button'

interface Props {
  onEdit: (item: ScheduledItem) => void
}

export function UpcomingScheduleList({ onEdit }: Props) {
  const items = useAppStore((s) => s.items)
  const pillars = useAppStore((s) => s.pillars)
  const updateItem = useAppStore((s) => s.updateItem)

  const todayStr = new Date().toISOString().slice(0, 10)
  const upcoming = useMemo(
    () =>
      items
        .filter((i) => i.date >= todayStr && i.status !== 'posted' && i.status !== 'skipped')
        .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
        .slice(0, 6),
    [items, todayStr],
  )

  return (
    <Card padding="lg" className="lg:col-span-2">
      <div className="flex items-center gap-2">
        <CalendarClock size={16} className="text-[var(--brand)]" />
        <h3 className="text-sm font-semibold text-[var(--text)]">Upcoming schedule</h3>
      </div>

      {upcoming.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--text-muted)]">
          Nothing scheduled yet. Use the "Up next" suggestion above or add one from the Calendar.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-[var(--border)]">
          {upcoming.map((item) => {
            const pillar = pillars.find((p) => p.id === item.pillarId)
            return (
              <li key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: pillar?.color ?? 'var(--text-faint)' }}
                />
                <button onClick={() => onEdit(item)} className="min-w-0 flex-1 text-left">
                  <p className="truncate text-sm font-medium text-[var(--text)]">{item.title}</p>
                  <p className="truncate text-xs text-[var(--text-muted)]">
                    {format(parseISO(item.date), 'EEE, MMM d')} · {item.time} {pillar ? `· ${pillar.name}` : ''}
                  </p>
                </button>
                <StatusBadge status={item.status} />
                {item.status !== 'posted' && (
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={<Check size={13} />}
                    onClick={() => updateItem(item.id, { status: 'posted' })}
                  >
                    Posted
                  </Button>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}
