# GenAI Demo

A Next.js (App Router) demo that delivers the “Picture Day → Analyze → Play” flow for youth sports programs.

## What the demo does
- Create Programs and Athletes with consent and minimal PII.
- Capture a quick “Picture Day” survey for personalization.
- Create Sessions with uploaded or bundled sample videos.
- Run deterministic mock analysis (or optional OpenAI narrative) to produce metrics, cues, report cards, and practice plans.
- Render athlete dashboards with analysis artifacts and gamified progression.
- Render coach/program dashboard with participation summaries and CSV export for upstream reporting.

## Tech stack
- Next.js 14 (TypeScript, App Router)
- Prisma + SQLite
- TailwindCSS
- Analysis provider interface with Mock + optional OpenAI provider

## Getting started
1. Install deps:
   ```bash
   npm install
   ```
2. Set env vars:
   ```bash
   cp .env.example .env
   # optional: add OPENAI_API_KEY for narrative provider
   ```
3. Run migrations and seed demo data:
   ```bash
   npx prisma migrate dev --name init
   npm run prisma:seed
   ```
4. Start the app:
   ```bash
   npm run dev
   ```
   The app seeds an Oswegoland-style pilot with ready-to-click athletes and sessions.

## Demo script (happy path)
1. Home → review stats and click “Create Athlete” to add a new player with consent.
2. On the athlete detail page, complete the Picture Day survey and save.
3. Create a session by choosing a drill and either picking a sample video or uploading one.
4. Click **Analyze** to run the mock provider (fast, deterministic). If `OPENAI_API_KEY` is set, narrative cues use OpenAI; otherwise “mock mode” applies.
5. Review the Metrics, Coach cues, Practice plan, and Report card. Observe the Progression widget (Play flow).
6. Visit **Coach Dashboard** to view participation, improvement buckets, and export CSV for upstream reporting.

## Environment variables
- `DATABASE_URL` – SQLite path (`file:./dev.db` default)
- `OPENAI_API_KEY` – optional; if absent, app stays in mock narrative mode

## Project structure
```
/prisma/schema.prisma       Prisma models
/prisma/seed.ts             Seed data (program + athletes + sessions + analysis)
/src/lib/analysis           Provider interface + implementations
/src/app/*                  App Router routes and UI
/public/storage/uploads     Local uploads (created at runtime)
/public/sample_videos       Bundled sample clips
```

## Testing
- Unit: `npm test` (deterministic MockProvider output)

## Limitations (demo-only)
- Motion analysis is mocked; no true 3D or kinematic accuracy.
- Local file storage; not production-grade for youth data.
- Auth is omitted; app is single-user for demo purposes.
- Sample videos are placeholders; replace with real clips for richer playback.

## Known issues / next steps
- Add PDF export alongside CSV for program directors.
- Improve video player with synchronized overlays and reference playback.
- Add auth/roles for coaches vs parents.
