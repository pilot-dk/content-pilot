import { differenceInCalendarDays, parseISO } from 'date-fns'
import type { ContentPillar, ScheduledItem } from '../types'

export interface PillarStat {
  pillar: ContentPillar
  timesUsed: number
  lastUsedDate: string | null
  daysSinceUsed: number
  rotationScore: number
}

/** Ranks pillars by a weighted round-robin: high weight + long time unused rises to the top. */
export function pillarStats(pillars: ContentPillar[], items: ScheduledItem[], today: Date): PillarStat[] {
  return pillars
    .map((pillar) => {
      const used = items
        .filter((i) => i.pillarId === pillar.id)
        .sort((a, b) => b.date.localeCompare(a.date))
      const lastUsedDate = used[0]?.date ?? null
      const daysSinceUsed = lastUsedDate ? Math.max(0, differenceInCalendarDays(today, parseISO(lastUsedDate))) : 999
      const rotationScore = pillar.weight * (daysSinceUsed + 1)
      return { pillar, timesUsed: used.length, lastUsedDate, daysSinceUsed, rotationScore }
    })
    .sort((a, b) => b.rotationScore - a.rotationScore)
}

export function suggestNextPillar(pillars: ContentPillar[], items: ScheduledItem[], today: Date): ContentPillar | null {
  if (pillars.length === 0) return null
  return pillarStats(pillars, items, today)[0].pillar
}
