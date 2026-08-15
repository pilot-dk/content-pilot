import type { Niche } from '../types'

export interface NicheMeta {
  id: Niche
  label: string
  emoji: string
  description: string
}

export const NICHES: NicheMeta[] = [
  { id: 'gaming', label: 'Gaming', emoji: '🎮', description: 'Let’s plays, esports, reviews' },
  { id: 'education', label: 'Education', emoji: '📚', description: 'Tutorials, explainers, courses' },
  { id: 'comedy_entertainment', label: 'Comedy & Entertainment', emoji: '🎭', description: 'Skits, reactions, pop culture' },
  { id: 'beauty_fashion', label: 'Beauty & Fashion', emoji: '💄', description: 'GRWM, hauls, tutorials' },
  { id: 'fitness_health', label: 'Fitness & Health', emoji: '💪', description: 'Workouts, wellness, nutrition' },
  { id: 'tech_reviews', label: 'Tech & Reviews', emoji: '💻', description: 'Gadgets, software, unboxings' },
  { id: 'business_finance', label: 'Business & Finance', emoji: '📈', description: 'Money, careers, entrepreneurship' },
  { id: 'food_cooking', label: 'Food & Cooking', emoji: '🍳', description: 'Recipes, reviews, cooking shows' },
  { id: 'music', label: 'Music', emoji: '🎵', description: 'Originals, covers, production' },
  { id: 'vlog_lifestyle', label: 'Vlog & Lifestyle', emoji: '🌿', description: 'Day-in-the-life, personal stories' },
  { id: 'news_commentary', label: 'News & Commentary', emoji: '📰', description: 'Current events, hot takes' },
  { id: 'art_design', label: 'Art & Design', emoji: '🎨', description: 'Illustration, process, design' },
  { id: 'travel', label: 'Travel', emoji: '✈️', description: 'Guides, adventures, culture' },
  { id: 'parenting_family', label: 'Parenting & Family', emoji: '👨‍👩‍👧', description: 'Family life, parenting tips' },
  { id: 'sports', label: 'Sports', emoji: '🏀', description: 'Analysis, highlights, training' },
]

export function nicheMeta(id: Niche): NicheMeta {
  return NICHES.find((n) => n.id === id) ?? NICHES[0]
}

/**
 * Returns a -0.3..+0.3 score nudge for how well a given hour/day fits the
 * typical audience rhythm of a niche, layered on top of platform base scores.
 */
export function nicheTimeBoost(niche: Niche, day: number, hour: number): number {
  const isWeekend = day === 0 || day === 6
  switch (niche) {
    case 'gaming':
      return hour >= 18 || hour < 1 ? 0.25 : isWeekend && hour >= 12 ? 0.15 : 0
    case 'education':
      return !isWeekend && hour >= 6 && hour < 12 ? 0.2 : 0
    case 'comedy_entertainment':
      return hour >= 17 && hour < 23 ? 0.15 : 0
    case 'beauty_fashion':
      return (hour >= 11 && hour < 13) || (hour >= 18 && hour < 21) ? 0.15 : 0
    case 'fitness_health':
      return hour >= 5 && hour < 8 ? 0.25 : hour >= 17 && hour < 19 ? 0.1 : 0
    case 'tech_reviews':
      return !isWeekend && hour >= 11 && hour < 15 ? 0.15 : 0
    case 'business_finance':
      return !isWeekend && hour >= 7 && hour < 9 ? 0.25 : isWeekend ? -0.2 : 0
    case 'food_cooking':
      return hour >= 16 && hour < 18 ? 0.2 : isWeekend && hour >= 9 && hour < 12 ? 0.15 : 0
    case 'music':
      return day === 5 ? 0.3 : hour >= 19 ? 0.15 : 0
    case 'vlog_lifestyle':
      return isWeekend ? 0.15 : hour >= 18 ? 0.1 : 0
    case 'news_commentary':
      return hour >= 6 && hour < 9 ? 0.25 : 0
    case 'art_design':
      return hour >= 13 && hour < 17 ? 0.15 : 0
    case 'travel':
      return isWeekend ? 0.25 : 0
    case 'parenting_family':
      return (hour >= 9 && hour < 11) || (hour >= 20 && hour < 22) ? 0.2 : 0
    case 'sports':
      return hour >= 18 ? 0.2 : isWeekend && hour >= 12 && hour < 18 ? 0.2 : 0
    default:
      return 0
  }
}
