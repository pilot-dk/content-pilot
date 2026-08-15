# ContentPilot 🚀

A scheduler built specifically for content creators. Tell it the platform you post to and the kind of content you make, and it tells you **when** to post, **what** to make next, and helps you stay consistent with streaks, monthly goals, and yearly goals.

## Features

- **Guided onboarding** — pick your platform (YouTube, TikTok, Reels, Twitch, Podcast, X, LinkedIn, Facebook, YouTube Shorts), your niche (15 options, from gaming to business/finance), and your weekly upload cadence.
- **Best-time-to-post engine** — combines platform-level audience patterns (day-of-week + time-of-day windows) with niche-specific timing boosts (e.g. gaming skews evening, business/finance skews early weekday mornings, music skews Friday releases) to rank upcoming time slots.
- **"Up next" content suggestions** — a weighted round-robin rotation over your content pillars (content types) so you keep variety instead of repeating the same format, paired with the best upcoming slot to publish it.
- **Content pillars** — define the types of videos you make, prioritize them, and track how often and how recently each has been used.
- **Calendar** — a full month view for planning, with "great day to post" highlighting based on the recommendation engine.
- **Consistency streaks** — tracks consecutive weeks you've hit your upload goal, plus your longest streak ever.
- **Monthly & yearly goals** — auto-tracked upload goals, plus manually-tracked goals for subscribers, views, watch hours, revenue, or anything custom.
- **Local-first** — everything is stored in your browser (`localStorage`); export/import a JSON backup any time from Settings.
- **Light / dark / system theme.**

## Tech stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/) for the build tooling
- [Tailwind CSS v4](https://tailwindcss.com/) for styling
- [Zustand](https://github.com/pmndrs/zustand) (with `persist`) for state management
- [React Router](https://reactrouter.com/) for client-side routing
- [date-fns](https://date-fns.org/) for date math
- [lucide-react](https://lucide.dev/) for icons

No backend, no database, no API keys required — it's a static single-page app.

## Getting started

```bash
npm install
npm run dev
```

Open the printed local URL in your browser. On first run you'll be walked through a short onboarding flow to set up your creator profile.

### Build for production

```bash
npm run build
npm run preview
```

`npm run build` outputs a static site to `dist/` that can be deployed anywhere that serves static files (Vercel, Netlify, GitHub Pages, Cloudflare Pages, etc.).

## Project structure

```
src/
  types.ts                  Core domain types
  data/                     Static reference data (platforms, niches, pillar templates)
  lib/                      Pure logic: recommendation engine, pillar rotation, streaks, goals
  store/useAppStore.ts      Zustand store (persisted to localStorage)
  components/
    onboarding/             First-run setup wizard
    layout/                 Sidebar, mobile nav, topbar, shell
    dashboard/               Home screen — up-next, streak, best times, goals, activity, schedule
    calendar/                Month view + add/edit schedule modal
    pillars/                 Content pillar management
    goals/                   Monthly/yearly goal tracking
    settings/                 Profile editing, theme, backup/restore, reset
    ui/                       Small reusable UI primitives
```

## How the recommendation engine works

- Each platform has a set of general best-posting time windows and a relative audience-availability weight per day of week (`src/data/platforms.ts`).
- Each niche nudges those scores toward the hours its audience is typically most active (`src/data/niches.ts`) — e.g. fitness content gets a boost in early mornings, gaming content gets a boost in evenings/nights.
- `src/lib/recommendations.ts` combines these into a score per candidate slot and ranks them, skipping any date you've already scheduled something for.
- `src/lib/rotation.ts` suggests your next content pillar with a weighted round-robin: `priority × (days since last used)`, so high-priority pillars resurface faster but nothing gets suggested on repeat forever.
- `src/lib/streak.ts` groups posted items into ISO weeks and counts consecutive weeks meeting your weekly upload goal.

These are heuristics based on well-documented general audience behavior per platform — not a live analytics integration. If you want to plug in a real analytics API for your own account, `src/lib/recommendations.ts` is the place to extend.

## License

MIT — see [LICENSE](LICENSE).
