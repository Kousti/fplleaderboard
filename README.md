# FPL OP.GG Leaderboard

Finnhouse EUW ranked solo/duo team leaderboard with snapshot history.

- **Display**: Next.js on Vercel (free)
- **LP fetch**: server-side cron job (Riot API key never exposed to browser)
- **History**: Supabase Postgres (free tier)

## Setup

### 1. Riot API key

1. Go to [Riot Developer Portal](https://developer.riotgames.com/)
2. Sign in and copy your API key
3. Add it as `RIOT_API_KEY`

**Important:** Development keys **expire every 24 hours**. Click **Regenerate API Key** in the portal when requests start returning 403/401.

For a Vercel deployment that runs on a cron schedule, apply for a **Personal/Production API key** in the portal so it does not expire daily.

### 2. Supabase database

1. Create a free project at [supabase.com](https://supabase.com)
2. Open **SQL Editor** and run [`supabase/schema.sql`](./supabase/schema.sql)
3. From **Project Settings → API**, copy:
   - Project URL → `SUPABASE_URL`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (server-only, never expose in frontend)

### 3. Local env

```bash
cp .env.example .env.local
```

Fill in all values. Generate a random `CRON_SECRET` (e.g. `openssl rand -hex 32`).

### 4. Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. First data fetch

Trigger the update job manually (needs env vars configured):

```bash
curl -X POST http://localhost:3000/api/cron/update-lp \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

This fetches all player ranks from Riot and saves a snapshot to Supabase.

## Deploy to Vercel (free)

1. Push this repo to GitHub
2. Import the repo in [Vercel](https://vercel.com)
3. Add environment variables (same as `.env.local`):
   - `RIOT_API_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `CRON_SECRET`
4. Deploy

Vercel Cron in [`vercel.json`](./vercel.json) is set to once daily (Hobby plan limit). LP updates run every **30 minutes** via [`.github/workflows/update-lp.yml`](./.github/workflows/update-lp.yml).

### GitHub Actions cron (recommended)

1. Add GitHub repo secrets:
   - `VERCEL_APP_URL` — e.g. `https://your-app.vercel.app`
   - `CRON_SECRET` — same value as in Vercel
2. The workflow calls your update endpoint every 30 minutes (`*/30 * * * *`, UTC)

## How scoring works

Teams are ranked by **total LP score** across all players (solo/duo only).

Each player's rank is converted to a numeric score for sorting:

- Iron IV 0 LP → 0 pts
- Each tier adds 400 pts, each division adds 100 pts, plus current LP (0–99)
- Master / Grandmaster / Challenger use separate tier bases so high LP does not overflow into the wrong tier

Team standings use the **sum of player points**. The Rank column shows the real tier from Riot; Pts is the comparable score.

Ziwi has 6 players; other teams have 5.

## API

| Endpoint | Description |
|----------|-------------|
| `GET /api/leaderboard` | Latest snapshot |
| `GET /api/history?limit=100` | Team score history |
| `POST /api/cron/update-lp` | Fetch from Riot + save snapshot (requires `Authorization: Bearer CRON_SECRET`) |

## Teams

Rosters are defined in [`src/lib/teams.ts`](./src/lib/teams.ts) with OP.GG multisearch links.
