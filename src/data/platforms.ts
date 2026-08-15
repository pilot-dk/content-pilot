import type { Platform, TimeSlot } from '../types'

export interface PlatformMeta {
  id: Platform
  label: string
  short: string
  color: string
  description: string
  formatHint: string
  emoji: string
}

export const PLATFORMS: PlatformMeta[] = [
  {
    id: 'youtube',
    label: 'YouTube (long-form)',
    short: 'YouTube',
    color: '#FF3B30',
    description: 'Long-form video, 8–25 min sweet spot',
    formatHint: 'Long-form video',
    emoji: '📺',
  },
  {
    id: 'youtube_shorts',
    label: 'YouTube Shorts',
    short: 'Shorts',
    color: '#FF3B30',
    description: 'Vertical short-form, under 60s',
    formatHint: 'Short-form video',
    emoji: '🎬',
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    short: 'TikTok',
    color: '#25F4EE',
    description: 'Vertical short-form, 15–60s',
    formatHint: 'Short-form video',
    emoji: '🎵',
  },
  {
    id: 'instagram_reels',
    label: 'Instagram Reels',
    short: 'Reels',
    color: '#E1306C',
    description: 'Vertical short-form, 15–90s',
    formatHint: 'Short-form video',
    emoji: '📸',
  },
  {
    id: 'twitch',
    label: 'Twitch',
    short: 'Twitch',
    color: '#9146FF',
    description: 'Live streaming',
    formatHint: 'Live stream',
    emoji: '🕹️',
  },
  {
    id: 'podcast',
    label: 'Podcast',
    short: 'Podcast',
    color: '#8E44AD',
    description: 'Audio / video podcast episodes',
    formatHint: 'Episode',
    emoji: '🎙️',
  },
  {
    id: 'twitter_x',
    label: 'X (Twitter)',
    short: 'X',
    color: '#1D9BF0',
    description: 'Short-form text, threads, video',
    formatHint: 'Post / thread',
    emoji: '✖️',
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    short: 'LinkedIn',
    color: '#0A66C2',
    description: 'Professional posts & video',
    formatHint: 'Post / video',
    emoji: '💼',
  },
  {
    id: 'facebook',
    label: 'Facebook',
    short: 'Facebook',
    color: '#1877F2',
    description: 'Posts, video & reels',
    formatHint: 'Post / video',
    emoji: '👥',
  },
]

export function platformMeta(id: Platform): PlatformMeta {
  return PLATFORMS.find((p) => p.id === id) ?? PLATFORMS[0]
}

// Relative audience-availability weight per weekday (0 = Sunday .. 6 = Saturday),
// derived from well-documented general engagement patterns per platform.
export const PLATFORM_DAY_WEIGHTS: Record<Platform, number[]> = {
  youtube: [1.0, 0.55, 0.55, 0.6, 0.7, 0.85, 0.95],
  youtube_shorts: [0.9, 0.75, 0.75, 0.8, 0.85, 0.95, 0.95],
  tiktok: [0.85, 0.75, 0.8, 0.85, 0.95, 1.0, 0.9],
  instagram_reels: [0.7, 0.8, 0.9, 0.95, 1.0, 0.85, 0.7],
  twitch: [0.85, 0.55, 0.65, 0.8, 0.9, 1.0, 0.95],
  podcast: [0.5, 0.9, 1.0, 0.95, 0.8, 0.55, 0.45],
  twitter_x: [0.5, 0.85, 0.95, 1.0, 0.9, 0.6, 0.45],
  linkedin: [0.15, 0.75, 1.0, 0.95, 0.85, 0.35, 0.1],
  facebook: [0.6, 0.65, 0.8, 0.95, 1.0, 0.85, 0.65],
}

// Recommended posting windows per platform (24h local time).
export const PLATFORM_SLOTS: Record<Platform, { start: string; end: string; label: string; baseScore: number }[]> = {
  youtube: [
    { start: '08:00', end: '10:00', label: 'Morning browse', baseScore: 0.55 },
    { start: '14:00', end: '16:00', label: 'Afternoon lull', baseScore: 0.8 },
    { start: '18:00', end: '21:00', label: 'Prime evening viewing', baseScore: 1.0 },
  ],
  youtube_shorts: [
    { start: '07:00', end: '09:00', label: 'Morning scroll', baseScore: 0.7 },
    { start: '12:00', end: '13:30', label: 'Lunch scroll', baseScore: 0.75 },
    { start: '19:00', end: '22:00', label: 'Evening scroll', baseScore: 1.0 },
  ],
  tiktok: [
    { start: '06:30', end: '09:00', label: 'Early scroll', baseScore: 0.65 },
    { start: '11:00', end: '13:00', label: 'Lunch scroll', baseScore: 0.8 },
    { start: '19:00', end: '23:00', label: 'Peak evening scroll', baseScore: 1.0 },
  ],
  instagram_reels: [
    { start: '11:00', end: '13:00', label: 'Lunch break', baseScore: 0.85 },
    { start: '17:00', end: '19:00', label: 'Commute home', baseScore: 0.9 },
    { start: '19:00', end: '21:00', label: 'Evening wind-down', baseScore: 1.0 },
  ],
  twitch: [
    { start: '12:00', end: '16:00', label: 'Weekend daytime audience', baseScore: 0.7 },
    { start: '18:00', end: '23:00', label: 'Prime streaming hours', baseScore: 1.0 },
  ],
  podcast: [
    { start: '06:00', end: '08:00', label: 'Morning commute', baseScore: 0.95 },
    { start: '12:00', end: '13:00', label: 'Lunch walk / drive', baseScore: 0.65 },
    { start: '17:00', end: '18:30', label: 'Evening commute', baseScore: 0.85 },
  ],
  twitter_x: [
    { start: '08:00', end: '10:00', label: 'Morning check-in', baseScore: 0.85 },
    { start: '12:00', end: '13:00', label: 'Lunch check-in', baseScore: 0.8 },
    { start: '17:00', end: '18:30', label: 'End-of-day scroll', baseScore: 1.0 },
  ],
  linkedin: [
    { start: '07:30', end: '09:00', label: 'Before-work scroll', baseScore: 1.0 },
    { start: '12:00', end: '13:00', label: 'Lunch break', baseScore: 0.75 },
  ],
  facebook: [
    { start: '09:00', end: '11:00', label: 'Mid-morning browse', baseScore: 0.7 },
    { start: '13:00', end: '15:00', label: 'Early afternoon', baseScore: 1.0 },
  ],
}

export function dayWeights(platform: Platform): number[] {
  return PLATFORM_DAY_WEIGHTS[platform]
}

export function slotsFor(platform: Platform): TimeSlot[] {
  return PLATFORM_SLOTS[platform].map((s) => ({ day: -1, start: s.start, end: s.end, label: s.label }))
}
