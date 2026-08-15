import { useMemo, useState } from 'react'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns'
import { ChevronLeft, ChevronRight, Plus, Sparkles } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { bestSlotForDate } from '../../lib/recommendations'
import type { ScheduledItem } from '../../types'
import { Topbar } from '../layout/Topbar'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { ScheduleItemModal } from './ScheduleItemModal'

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function CalendarPage() {
  const profile = useAppStore((s) => s.profile)
  const items = useAppStore((s) => s.items)
  const pillars = useAppStore((s) => s.pillars)

  const [monthCursor, setMonthCursor] = useState(new Date())
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [modalState, setModalState] = useState<
    { mode: 'closed' } | { mode: 'create'; date: string; time: string } | { mode: 'edit'; item: ScheduledItem }
  >({ mode: 'closed' })

  const today = new Date()

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(monthCursor), { weekStartsOn: 1 })
    const end = endOfWeek(endOfMonth(monthCursor), { weekStartsOn: 1 })
    return eachDayOfInterval({ start, end })
  }, [monthCursor])

  const itemsByDate = useMemo(() => {
    const map = new Map<string, ScheduledItem[]>()
    for (const item of items) {
      const arr = map.get(item.date) ?? []
      arr.push(item)
      map.set(item.date, arr)
    }
    return map
  }, [items])

  const openCreate = (dateStr: string) => {
    const best = profile ? bestSlotForDate(profile.platform, profile.niche, new Date(dateStr + 'T00:00:00')) : null
    setModalState({ mode: 'create', date: dateStr, time: best?.start ?? '18:00' })
  }

  return (
    <div>
      <Topbar title="Calendar" subtitle="Plan your schedule and see the best windows to post." />

      <div className="p-5 md:p-8">
        <Card padding="none" className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMonthCursor((d) => subMonths(d, 1))}
                className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-subtle)]"
                aria-label="Previous month"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="w-36 text-center text-sm font-semibold text-[var(--text)]">
                {format(monthCursor, 'MMMM yyyy')}
              </span>
              <button
                onClick={() => setMonthCursor((d) => addMonths(d, 1))}
                className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-subtle)]"
                aria-label="Next month"
              >
                <ChevronRight size={18} />
              </button>
              <Button variant="secondary" size="sm" onClick={() => setMonthCursor(new Date())}>
                Today
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)]">
                <input
                  type="checkbox"
                  checked={showSuggestions}
                  onChange={(e) => setShowSuggestions(e.target.checked)}
                  className="accent-[var(--brand)]"
                />
                <Sparkles size={13} className="text-[var(--brand)]" />
                Highlight best days
              </label>
              <Button size="sm" icon={<Plus size={14} />} onClick={() => openCreate(format(today, 'yyyy-MM-dd'))}>
                Add video
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 border-b border-[var(--border)] text-center text-xs font-medium text-[var(--text-faint)]">
            {WEEKDAY_LABELS.map((d) => (
              <div key={d} className="py-2">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {days.map((day) => {
              const dateStr = format(day, 'yyyy-MM-dd')
              const dayItems = itemsByDate.get(dateStr) ?? []
              const inMonth = isSameMonth(day, monthCursor)
              const isToday = isSameDay(day, today)
              const best = profile ? bestSlotForDate(profile.platform, profile.niche, day) : null
              const isGreatDay = showSuggestions && inMonth && !!best && best.score >= 0.85

              return (
                <div
                  key={dateStr}
                  onClick={() => openCreate(dateStr)}
                  className={`flex min-h-[104px] cursor-pointer flex-col gap-1 border-b border-r border-[var(--border)] p-1.5 transition-colors hover:bg-[var(--bg-subtle)] ${
                    inMonth ? '' : 'opacity-40'
                  } ${isGreatDay ? 'bg-[var(--brand-soft)]/60' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-medium ${
                        isToday ? 'bg-[var(--brand)] text-white' : 'text-[var(--text-muted)]'
                      }`}
                    >
                      {format(day, 'd')}
                    </span>
                    {isGreatDay && <Sparkles size={11} className="text-[var(--brand)]" />}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    {dayItems.slice(0, 3).map((item) => {
                      const pillar = pillars.find((p) => p.id === item.pillarId)
                      return (
                        <button
                          key={item.id}
                          onClick={(e) => {
                            e.stopPropagation()
                            setModalState({ mode: 'edit', item })
                          }}
                          className="flex items-center gap-1 truncate rounded-md bg-[var(--bg-elevated)] px-1 py-0.5 text-left text-[10px] font-medium text-[var(--text)] shadow-sm"
                        >
                          <span
                            className="h-1.5 w-1.5 shrink-0 rounded-full"
                            style={{ backgroundColor: pillar?.color ?? 'var(--text-faint)' }}
                          />
                          <span className="truncate">{item.title}</span>
                        </button>
                      )
                    })}
                    {dayItems.length > 3 && (
                      <span className="text-[10px] text-[var(--text-faint)]">+{dayItems.length - 3} more</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      {modalState.mode === 'create' && (
        <ScheduleItemModal
          onClose={() => setModalState({ mode: 'closed' })}
          initialDate={modalState.date}
          initialTime={modalState.time}
        />
      )}
      {modalState.mode === 'edit' && (
        <ScheduleItemModal onClose={() => setModalState({ mode: 'closed' })} existing={modalState.item} />
      )}
    </div>
  )
}
