import { useMemo, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { RefreshCw, Sparkles } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { nextRecommendedSlots } from '../../lib/recommendations'
import { suggestNextPillar } from '../../lib/rotation'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'

interface Props {
  onSchedule: (args: { date: string; time: string; pillarId: string | null; title: string }) => void
}

export function NextUpCard({ onSchedule }: Props) {
  const profile = useAppStore((s) => s.profile)
  const pillars = useAppStore((s) => s.pillars)
  const items = useAppStore((s) => s.items)
  const [slotIndex, setSlotIndex] = useState(0)

  const today = useMemo(() => new Date(), [])
  const occupiedDates = useMemo(() => new Set(items.map((i) => i.date)), [items])
  const slots = useMemo(
    () => (profile ? nextRecommendedSlots(profile.platform, profile.niche, today, occupiedDates, 5) : []),
    [profile, today, occupiedDates],
  )
  const pillar = useMemo(() => suggestNextPillar(pillars, items, today), [pillars, items, today])
  const slot = slots[slotIndex % Math.max(1, slots.length)]

  if (!profile) return null

  return (
    <Card padding="lg" className="relative overflow-hidden lg:col-span-2">
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[var(--brand)]/10 blur-2xl" />
      <div className="flex items-center gap-2 text-[var(--brand)]">
        <Sparkles size={16} />
        <span className="text-xs font-semibold uppercase tracking-wide">Up next</span>
      </div>

      {pillar && slot ? (
        <>
          <h2 className="mt-2 text-2xl font-semibold text-[var(--text)]">{pillar.name}</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">{pillar.description}</p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge color={pillar.color}>Suggested pillar</Badge>
            <Badge tone="brand">
              {format(parseISO(slot.date), 'EEE, MMM d')} · {slot.start}–{slot.end}
            </Badge>
          </div>

          <p className="mt-3 text-sm text-[var(--text-muted)]">{slot.reason}</p>

          <div className="mt-5 flex flex-wrap gap-2">
            <Button
              size="md"
              onClick={() =>
                onSchedule({ date: slot.date, time: slot.start, pillarId: pillar.id, title: pillar.name })
              }
            >
              Schedule this
            </Button>
            <Button
              variant="secondary"
              size="md"
              icon={<RefreshCw size={14} />}
              onClick={() => setSlotIndex((i) => (i + 1) % Math.max(1, slots.length))}
              disabled={slots.length <= 1}
            >
              Suggest another time
            </Button>
          </div>
        </>
      ) : (
        <p className="mt-3 text-sm text-[var(--text-muted)]">
          Add a content pillar to get a personalized "what to make next" suggestion.
        </p>
      )}
    </Card>
  )
}
