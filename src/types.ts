export type Platform =
  | 'youtube'
  | 'youtube_shorts'
  | 'tiktok'
  | 'instagram_reels'
  | 'twitch'
  | 'podcast'
  | 'twitter_x'
  | 'linkedin'
  | 'facebook'

export type Niche =
  | 'gaming'
  | 'education'
  | 'comedy_entertainment'
  | 'beauty_fashion'
  | 'fitness_health'
  | 'tech_reviews'
  | 'business_finance'
  | 'food_cooking'
  | 'music'
  | 'vlog_lifestyle'
  | 'news_commentary'
  | 'art_design'
  | 'travel'
  | 'parenting_family'
  | 'sports'

export interface CreatorProfile {
  displayName: string
  platform: Platform
  niche: Niche
  weeklyUploadGoal: number
  timezone: string
  createdAt: string
}

export interface ContentPillar {
  id: string
  name: string
  description: string
  color: string
  weight: number // 1 (low priority) - 5 (high priority)
}

export type ScheduleStatus = 'planned' | 'in_progress' | 'ready' | 'posted' | 'skipped'

export interface ScheduledItem {
  id: string
  title: string
  pillarId: string | null
  date: string // yyyy-MM-dd
  time: string // HH:mm
  status: ScheduleStatus
  notes?: string
  createdAt: string
}

export type GoalPeriod = 'monthly' | 'yearly'

export type GoalType = 'uploads' | 'subscribers' | 'views' | 'watch_hours' | 'revenue' | 'custom'

export interface Goal {
  id: string
  period: GoalPeriod
  periodKey: string // '2026-08' for monthly, '2026' for yearly
  type: GoalType
  label: string
  target: number
  current: number
  unit: string
  createdAt: string
}

export interface TimeSlot {
  day: number // 0=Sunday .. 6=Saturday
  start: string // HH:mm
  end: string // HH:mm
  label: string
}

export interface RecommendedSlot {
  date: string // yyyy-MM-dd
  start: string
  end: string
  score: number
  reason: string
}
