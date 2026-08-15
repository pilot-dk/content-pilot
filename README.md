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
- **Local-first free tier** — everything is stored in your browser (`localStorage`); export/import a JSON backup any time from Settings. No account required.
- **Pro tier ($7/mo)** — sign in (passwordless magic-link email) to unlock cross-device cloud sync, unlimited content pillars (free is capped at 5), and calendar (.ics) export. Billed via Stripe; manage or cancel anytime from the in-app Customer Portal link.
- **Light / dark / system theme.**

## Tech stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/) for the build tooling
- [Tailwind CSS v4](https://tailwindcss.com/) for styling
- [Zustand](https://github.com/pmndrs/zustand) (with `persist`) for state management
- [React Router](https://reactrouter.com/) for client-side routing
- [date-fns](https://date-fns.org/) for date math
- [lucide-react](https://lucide.dev/) for icons
- [Supabase](https://supabase.com/) for auth (magic-link email) + Postgres, powering Pro cloud sync
- [Stripe](https://stripe.com/) Checkout + Customer Portal for Pro billing, via two Vercel serverless functions

The free tier needs none of the above — it's a static single-page app with everything in `localStorage`. Supabase + Stripe are only required if you want to enable the paid Pro tier.

## Getting started

```bash
npm install
npm run dev
```

Open the printed local URL in your browser. On first run you'll be walked through a short onboarding flow to set up your creator profile. This works fully offline/local with zero configuration — Pro features stay hidden (with a small "not configured" note in Settings) until you set up the environment variables below.

### Build for production

```bash
npm run build
npm run preview
```

`npm run build` outputs a static site to `dist/` that can be deployed anywhere that serves static files. Deploying the `/api` serverless functions (used only for Stripe billing) requires Vercel specifically, since that's what they're written for.

## Enabling the Pro tier (optional)

1. **Create a [Supabase](https://supabase.com) project** (free tier is plenty). In the SQL Editor, run [`supabase/schema.sql`](supabase/schema.sql) once — it creates the `subscriptions` and `cloud_snapshots` tables with Row Level Security (writes to `cloud_snapshots` are only permitted for users with an `active` subscription, so the paywall is enforced at the database level, not just in the UI).
2. **Create a [Stripe](https://stripe.com) account**, add a Product with a recurring monthly Price (this app defaults to $7/mo, edit `AccountCard.tsx` / `PillarsPage.tsx` copy if you change it), and grab the Price id.
3. Copy [`.env.example`](.env.example) to `.env` and fill in:
   - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` — Supabase → Project Settings → API
   - `SUPABASE_SERVICE_ROLE_KEY` — same page, **secret**, server-only, used only inside `/api` functions
   - `STRIPE_SECRET_KEY` — Stripe → Developers → API keys
   - `STRIPE_PRO_PRICE_ID` — the recurring Price id from step 2
   - `PUBLIC_SITE_URL` — your deployed origin, e.g. `https://content-pilot.vercel.app`
4. Add the same variables to your Vercel project (Settings → Environment Variables), then deploy.
5. In Stripe → Developers → Webhooks, add an endpoint at `<your-site>/api/stripe-webhook` listening for `checkout.session.completed`, `customer.subscription.updated`, and `customer.subscription.deleted`. Copy the generated signing secret into `STRIPE_WEBHOOK_SECRET` (both locally and in Vercel), then redeploy.
6. In Stripe → Settings → Billing → Customer portal, activate the portal so the in-app "Manage billing" button works.

Everything degrades gracefully without these set — the app just runs as the free, local-only tool it started as.

## Project structure

```
src/
  types.ts                  Core domain types
  data/                     Static reference data (platforms, niches, pillar templates)
  lib/                      Pure logic: recommendation engine, pillar rotation, streaks, goals,
                             Supabase client, cloud sync, Stripe checkout/portal calls, .ics export
  store/
    useAppStore.ts          Zustand store for creator data (persisted to localStorage)
    useAuthStore.ts         Zustand store for auth/subscription state (backed by Supabase session)
  hooks/
    useCloudSync.ts         Pulls/pushes the app snapshot to Supabase for signed-in Pro users
    useUpgradeFlow.ts       Sign-in-then-checkout flow, reusable from any upsell prompt
  components/
    onboarding/             First-run setup wizard (+ "restore from cloud" prompt for Pro)
    layout/                 Sidebar, mobile nav, topbar, shell
    dashboard/               Home screen — up-next, streak, best times, goals, activity, schedule
    calendar/                Month view + add/edit schedule modal
    pillars/                 Content pillar management (free tier capped at 5)
    goals/                   Monthly/yearly goal tracking
    settings/                 Profile editing, account/billing, theme, backup/restore, reset
    auth/                    Magic-link sign-in modal
    ui/                       Small reusable UI primitives

api/                        Vercel serverless functions (Stripe checkout/portal/webhook)
supabase/schema.sql         Database schema + Row Level Security policies
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
