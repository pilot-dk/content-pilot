import { addWeeks, format, startOfWeek } from 'date-fns'
import type { ScheduledItem } from '../types'

export interface StreakInfo {
  currentStreakWeeks: number
  thisWeekPosted: number
  thisWeekGoal: number
  thisWeekComplete: boolean
  longestStreakWeeks: number
}

function weekKey(dateStr: string): string {
  return format(startOfWeek(new Date(dateStr + 'T00:00:00'), { weekStartsOn: 1 }), 'yyyy-MM-dd')
}

export interface WeeklyCount {
  weekStart: string
  label: string
  count: number
}

/** Posted-item counts for the last `weeks` ISO weeks (Mon start), oldest first, ending at the current week. */
export function weeklyPostedCounts(items: ScheduledItem[], weeks: number, today: Date): WeeklyCount[] {
  const posted = items.filter((i) => i.status === 'posted')
  const counts = new Map<string, number>()
  for (const item of posted) {
    const key = weekKey(item.date)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  const currentStart = startOfWeek(today, { weekStartsOn: 1 })
  const out: WeeklyCount[] = []
  for (let i = weeks - 1; i >= 0; i--) {
    const start = addWeeks(currentStart, -i)
    const key = format(start, 'yyyy-MM-dd')
    out.push({ weekStart: key, label: format(start, 'MMM d'), count: counts.get(key) ?? 0 })
  }
  return out
}

export function computeStreak(items: ScheduledItem[], weeklyGoal: number, today: Date): StreakInfo {
  const posted = items.filter((i) => i.status === 'posted')
  const counts = new Map<string, number>()
  for (const item of posted) {
    const key = weekKey(item.date)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  const currentWeekKey = format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd')
  const thisWeekPosted = counts.get(currentWeekKey) ?? 0
  const goal = Math.max(1, weeklyGoal)

  // Walk backwards from the last fully-completed week.
  let cursor = addWeeks(startOfWeek(today, { weekStartsOn: 1 }), -1)
  let currentStreakWeeks = 0
  // Include the current week in the streak if it has already hit goal.
  if (thisWeekPosted >= goal) currentStreakWeeks += 1
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const key = format(cursor, 'yyyy-MM-dd')
    const count = counts.get(key) ?? 0
    if (count >= goal) {
      currentStreakWeeks += 1
      cursor = addWeeks(cursor, -1)
    } else {
      break
    }
  }

  let longestStreakWeeks = 0
  let running = 0
  const sortedWeeks = Array.from(counts.keys()).sort()
  for (const key of sortedWeeks) {
    const count = counts.get(key) ?? 0
    if (count >= goal) {
      running += 1
      longestStreakWeeks = Math.max(longestStreakWeeks, running)
    } else {
      running = 0
    }
  }
  longestStreakWeeks = Math.max(longestStreakWeeks, currentStreakWeeks)

  return {
    currentStreakWeeks,
    thisWeekPosted,
    thisWeekGoal: goal,
    thisWeekComplete: thisWeekPosted >= goal,
    longestStreakWeeks,
  }
}
