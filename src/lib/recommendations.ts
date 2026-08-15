import { addDays, format, getDay } from 'date-fns'
import type { Niche, Platform, RecommendedSlot } from '../types'
import { PLATFORM_DAY_WEIGHTS, PLATFORM_SLOTS } from '../data/platforms'
import { nicheMeta, nicheTimeBoost } from '../data/niches'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function reasonFor(dow: number, label: string, boost: number, niche: Niche): string {
  const dayName = DAY_NAMES[dow]
  if (boost >= 0.2) {
    return `${dayName} · ${label} — a peak window for ${nicheMeta(niche).label.toLowerCase()} audiences`
  }
  return `${dayName} · ${label}`
}

function slotsForDay(platform: Platform, niche: Niche, date: Date): RecommendedSlot[] {
  const dow = getDay(date)
  const dayWeight = PLATFORM_DAY_WEIGHTS[platform][dow]
  const dateStr = format(date, 'yyyy-MM-dd')
  return PLATFORM_SLOTS[platform].map((slot) => {
    const hour = Number(slot.start.slice(0, 2))
    const boost = nicheTimeBoost(niche, dow, hour)
    const score = Math.round((slot.baseScore * dayWeight + boost) * 100) / 100
    return {
      date: dateStr,
      start: slot.start,
      end: slot.end,
      score,
      reason: reasonFor(dow, slot.label, boost, niche),
    }
  })
}

/** The single best slot on a given calendar date. */
export function bestSlotForDate(platform: Platform, niche: Niche, date: Date): RecommendedSlot {
  const slots = slotsForDay(platform, niche, date)
  return slots.reduce((best, s) => (s.score > best.score ? s : best), slots[0])
}

/** One best slot per day for the next `days` days, in date order — good for a weekly overview. */
export function upcomingDailyBestSlots(platform: Platform, niche: Niche, from: Date, days: number): RecommendedSlot[] {
  const out: RecommendedSlot[] = []
  for (let i = 0; i < days; i++) {
    out.push(bestSlotForDate(platform, niche, addDays(from, i)))
  }
  return out
}

/** Top N slots across the whole window, ranked by score — good for "best times to post this week". */
export function topUpcomingSlots(platform: Platform, niche: Niche, from: Date, days: number, count: number): RecommendedSlot[] {
  const all: RecommendedSlot[] = []
  for (let i = 0; i < days; i++) {
    all.push(...slotsForDay(platform, niche, addDays(from, i)))
  }
  all.sort((a, b) => b.score - a.score || a.date.localeCompare(b.date))
  return all.slice(0, count)
}

/**
 * Suggest the next slot(s) to schedule so the creator hits their weekly cadence,
 * skipping dates that already have a scheduled item.
 */
export function nextRecommendedSlots(
  platform: Platform,
  niche: Niche,
  from: Date,
  occupiedDates: Set<string>,
  count: number,
): RecommendedSlot[] {
  const candidates = topUpcomingSlots(platform, niche, from, 21, 60).filter((s) => !occupiedDates.has(s.date))
  const seenDates = new Set<string>()
  const picked: RecommendedSlot[] = []
  for (const slot of candidates) {
    if (seenDates.has(slot.date)) continue
    seenDates.add(slot.date)
    picked.push(slot)
    if (picked.length >= count) break
  }
  return picked.sort((a, b) => a.date.localeCompare(b.date) || a.start.localeCompare(b.start))
}
