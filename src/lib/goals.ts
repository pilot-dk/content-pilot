import { v4 as uuid } from 'uuid'
import { format } from 'date-fns'
import type { CreatorProfile, Goal, ScheduledItem } from '../types'

export function seedDefaultGoals(profile: CreatorProfile, now: Date): Goal[] {
  const monthlyTarget = Math.max(1, Math.round(profile.weeklyUploadGoal * 4.345))
  const yearlyTarget = Math.max(1, Math.round(profile.weeklyUploadGoal * 52))
  return [
    {
      id: uuid(),
      period: 'monthly',
      periodKey: format(now, 'yyyy-MM'),
      type: 'uploads',
      label: 'Videos published',
      target: monthlyTarget,
      current: 0,
      unit: 'videos',
      createdAt: now.toISOString(),
    },
    {
      id: uuid(),
      period: 'yearly',
      periodKey: format(now, 'yyyy'),
      type: 'uploads',
      label: 'Videos published',
      target: yearlyTarget,
      current: 0,
      unit: 'videos',
      createdAt: now.toISOString(),
    },
  ]
}

export interface GoalProgress {
  current: number
  target: number
  pct: number
}

/** For 'uploads' goals, current is derived live from posted schedule items. Other goal types are user-tracked. */
export function goalProgress(goal: Goal, items: ScheduledItem[]): GoalProgress {
  let current = goal.current
  if (goal.type === 'uploads') {
    const prefix = goal.period === 'monthly' ? goal.periodKey : goal.periodKey
    current = items.filter((i) => i.status === 'posted' && i.date.startsWith(prefix)).length
  }
  const target = Math.max(1, goal.target)
  const pct = Math.max(0, Math.min(100, Math.round((current / target) * 100)))
  return { current, target, pct }
}

export function currentPeriodKey(period: 'monthly' | 'yearly', now: Date): string {
  return period === 'monthly' ? format(now, 'yyyy-MM') : format(now, 'yyyy')
}
