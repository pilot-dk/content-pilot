import type { Niche } from '../types'

export interface PillarTemplate {
  name: string
  description: string
  weight: number
}

const COLORS = ['#7c5cff', '#ff5ca8', '#17b26a', '#f79009', '#2dd4ee']

export function colorForIndex(i: number): string {
  return COLORS[i % COLORS.length]
}

const GENERIC: PillarTemplate[] = [
  { name: 'Educational', description: 'Teach something useful in your niche', weight: 4 },
  { name: 'Entertainment', description: 'Fun, high-energy, made to be watched to the end', weight: 4 },
  { name: 'Behind-the-scenes', description: 'Process, personality, day-in-the-life', weight: 3 },
  { name: 'Trend / challenge', description: 'Ride a current trend with your own spin', weight: 3 },
  { name: 'Community / Q&A', description: 'Respond to comments, questions, requests', weight: 2 },
]

const BY_NICHE: Partial<Record<Niche, PillarTemplate[]>> = {
  gaming: [
    { name: 'Let’s Play', description: 'Extended gameplay with commentary', weight: 5 },
    { name: 'Guide / Tutorial', description: 'Tips, builds, walkthroughs', weight: 4 },
    { name: 'Highlights & Funny Moments', description: 'Best clips, fails, reactions', weight: 3 },
    { name: 'Tier List / Review', description: 'Ranking or reviewing games & gear', weight: 3 },
    { name: 'Live Reaction', description: 'Reacting to trailers, updates, drama', weight: 2 },
  ],
  education: [
    { name: 'Deep-dive Explainer', description: 'Break down one concept thoroughly', weight: 5 },
    { name: 'Quick Tip', description: 'One fast, actionable takeaway', weight: 4 },
    { name: 'Myth Busting', description: 'Correct a common misconception', weight: 3 },
    { name: 'Case Study', description: 'Walk through a real example', weight: 3 },
    { name: 'Q&A', description: 'Answer audience questions', weight: 2 },
  ],
  comedy_entertainment: [
    { name: 'Sketch', description: 'Scripted comedy bit', weight: 5 },
    { name: 'Reaction', description: 'Reacting to trending content', weight: 4 },
    { name: 'Pop-culture Take', description: 'Commentary on current events', weight: 3 },
    { name: 'Improv / Man-on-street', description: 'Unscripted audience interaction', weight: 3 },
    { name: 'Blooper / BTS', description: 'Behind-the-scenes and outtakes', weight: 2 },
  ],
  beauty_fashion: [
    { name: 'Tutorial', description: 'Step-by-step technique', weight: 5 },
    { name: 'GRWM', description: 'Get-ready-with-me, casual & personal', weight: 4 },
    { name: 'Product Review', description: 'Honest take on a product', weight: 4 },
    { name: 'Haul', description: 'New buys and first impressions', weight: 3 },
    { name: 'Trend / Challenge', description: 'Current beauty or fashion trend', weight: 2 },
  ],
  fitness_health: [
    { name: 'Workout / Follow-along', description: 'Full session viewers can do with you', weight: 5 },
    { name: 'Form / Technique Tips', description: 'Correcting common mistakes', weight: 4 },
    { name: 'Nutrition Breakdown', description: 'Meals, macros, habits', weight: 3 },
    { name: 'Transformation / Progress', description: 'Real progress and lessons learned', weight: 3 },
    { name: 'Myth Busting', description: 'Debunk fitness misinformation', weight: 2 },
  ],
  tech_reviews: [
    { name: 'Review', description: 'In-depth product review', weight: 5 },
    { name: 'Unboxing / First Look', description: 'First impressions on new releases', weight: 4 },
    { name: 'Comparison', description: 'Head-to-head between products', weight: 4 },
    { name: 'Tutorial / How-to', description: 'Setup guides and tips', weight: 3 },
    { name: 'News Commentary', description: 'React to industry announcements', weight: 2 },
  ],
  business_finance: [
    { name: 'Breakdown / Explainer', description: 'Explain a financial concept simply', weight: 5 },
    { name: 'Case Study', description: 'Analyze a real business or trade', weight: 4 },
    { name: 'News & Market Take', description: 'Commentary on current events', weight: 3 },
    { name: 'Tips & Frameworks', description: 'Actionable frameworks and checklists', weight: 3 },
    { name: 'Q&A / Mailbag', description: 'Answer audience questions', weight: 2 },
  ],
  food_cooking: [
    { name: 'Recipe Walkthrough', description: 'Full recipe, start to finish', weight: 5 },
    { name: 'Quick Tip / Hack', description: 'One useful kitchen trick', weight: 4 },
    { name: 'Taste Test / Review', description: 'Trying and rating food', weight: 3 },
    { name: 'What I Eat In a Day', description: 'Personal, relatable eating content', weight: 3 },
    { name: 'Trend / Challenge', description: 'Viral food trend with your spin', weight: 2 },
  ],
  music: [
    { name: 'Original Release', description: 'New original track or single', weight: 5 },
    { name: 'Cover', description: 'Your take on an existing song', weight: 4 },
    { name: 'Behind the Track', description: 'Production breakdown or story', weight: 3 },
    { name: 'Live Session', description: 'Stripped-down or live performance', weight: 3 },
    { name: 'Trend Sound', description: 'Jump on a trending audio', weight: 2 },
  ],
  vlog_lifestyle: [
    { name: 'Day-in-the-life', description: 'Follow-along daily vlog', weight: 5 },
    { name: 'Personal Story', description: 'A story or lesson from your life', weight: 4 },
    { name: 'Q&A', description: 'Answer follower questions', weight: 3 },
    { name: 'Routine / Habits', description: 'Morning, night, or productivity routines', weight: 3 },
    { name: 'Trend / Challenge', description: 'Fun trend participation', weight: 2 },
  ],
  news_commentary: [
    { name: 'Breaking Down the News', description: 'Explain a current event', weight: 5 },
    { name: 'Hot Take / Opinion', description: 'Your perspective on a story', weight: 4 },
    { name: 'Fact Check', description: 'Verify claims circulating online', weight: 3 },
    { name: 'Explainer / Context', description: 'Background on an ongoing topic', weight: 3 },
    { name: 'Q&A / Mailbag', description: 'Answer audience questions', weight: 2 },
  ],
  art_design: [
    { name: 'Process / Speed-run', description: 'Timelapse of a piece being made', weight: 5 },
    { name: 'Tutorial', description: 'Teach a specific technique', weight: 4 },
    { name: 'Critique / Review', description: 'Review tools, portfolios, or work', weight: 3 },
    { name: 'Client / Project Story', description: 'Walkthrough of a real project', weight: 3 },
    { name: 'Trend / Challenge', description: 'Art challenge or trending prompt', weight: 2 },
  ],
  travel: [
    { name: 'Destination Guide', description: 'What to do, eat, and see', weight: 5 },
    { name: 'Trip Vlog', description: 'Follow-along travel diary', weight: 4 },
    { name: 'Tips & Hacks', description: 'Packing, budget, booking tips', weight: 3 },
    { name: 'Culture / Food Spotlight', description: 'Local culture or cuisine deep-dive', weight: 3 },
    { name: 'Q&A / Planning', description: 'Answer trip-planning questions', weight: 2 },
  ],
  parenting_family: [
    { name: 'Day-in-the-life', description: 'Family routine, follow-along', weight: 5 },
    { name: 'Parenting Tip', description: 'One actionable parenting idea', weight: 4 },
    { name: 'Milestone / Story', description: 'Sharing a family moment or lesson', weight: 3 },
    { name: 'Product / Gear Review', description: 'Reviewing family products', weight: 3 },
    { name: 'Q&A', description: 'Answer follower questions', weight: 2 },
  ],
  sports: [
    { name: 'Analysis / Breakdown', description: 'Breaking down a game or play', weight: 5 },
    { name: 'Highlights', description: 'Best moments with commentary', weight: 4 },
    { name: 'Training / Technique', description: 'Skill and training tips', weight: 3 },
    { name: 'Hot Take / Debate', description: 'Opinion on a current storyline', weight: 3 },
    { name: 'Q&A / Mailbag', description: 'Answer audience questions', weight: 2 },
  ],
}

export function defaultPillarsFor(niche: Niche): PillarTemplate[] {
  return BY_NICHE[niche] ?? GENERIC
}
