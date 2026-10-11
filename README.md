# Kiddies Check Spotlight

## Live Demo: https://spotlight.kiddiescheck.org

An analytics dashboard for Kiddies Check. Directors, school leaders and administrators see attendance and assessment KPIs across their schools, then drill down: **network → school → arm**.

Spotlight has no backend or database of its own. Everything comes from the Kiddies Check API, proxied through `/api/kc/*`.

## Run it locally

```bash
cp .env.example .env.local   # point KIDDIES_CHECK_URL at a Kiddies Check instance
npm install
npm run dev                  # http://localhost:3001
```

Sign in with a Kiddies Check account. You need to be an admin, learning specialist, school director (or another all-school platform role), or a school leader. Teachers and parents are refused.

To use a local Kiddies Check, run it on port 3000 and set `KIDDIES_CHECK_URL=http://localhost:3000`.

The service worker only registers in production builds (`npm run build && npm start`), so test offline behaviour there.

## Deploy (Vercel)

1. Import the repository into Vercel. The framework preset is Next.js; no build settings need changing.
2. Set the environment variable `KIDDIES_CHECK_URL` to `https://www.kiddiescheck.org`. Next.js bakes the proxy target in at build time, so redeploy after changing it.
   Use the exact host Kiddies Check serves from. `https://kiddiescheck.org` (without `www`) redirects to `www`. The proxy passes that redirect to the browser, which then calls Kiddies Check directly; the cross-origin request is blocked and sign-in fails.
3. Deploy the matching Kiddies Check version first. Spotlight needs its `/api/spotlight/*` endpoints.

## How it works

```
Browser ──► Spotlight (Next.js on Vercel)
              │  /api/kc/*  rewrite (next.config.ts)
              ▼
            Kiddies Check API ──► MongoDB
```

- **Proxy, not CORS.** The browser only ever talks to Spotlight's origin. That keeps the service worker able to cache API responses, and means Kiddies Check needs no CORS changes.
- **Auth.** `POST /api/auth/login` returns the existing Kiddies Check JWT. Spotlight stores it in `localStorage` and sends it as `Authorization: Bearer`. Any 401 signs the user out. Signing out clears the token, the data cache and the service worker's API cache.
- **URL state.** The active KPI, period, date and tab are query parameters (`?kpi=present&period=week&date=2026-09-21`). Every drill-down link and breadcrumb carries them, so they persist as you move between levels, survive reloads, and can be shared.
- **Caching.** SWR caches each view and keeps the previous view on screen while the next loads. It revalidates on focus and deduplicates requests within 30 s. Hovering a row preloads that school's view. The 40 most recent views are saved to `localStorage`, so they show instantly on reload and while offline.
- **Offline (PWA).** `public/sw.js` handles three kinds of request:
  - **App files:** precached, plus content-hashed `/_next/static` assets cached on first use.
  - **Page navigations:** network first, falling back to the cached page or `/offline`.
  - **Spotlight data:** network first, falling back to the last cached response.
- **Install.** `src/app/manifest.ts` defines the web app manifest. Icons are rendered to PNG at build time from `SpotlightMark`, so there are no binary assets to keep in sync.

## Project structure

```
src/
  app/
    (dashboard)/           signed-in area; layout.tsx gates on session + Spotlight access
      page.tsx             "/" → redirects to the user's landing level
      network/             all schools in scope
      schools/[id]/        one school (rows = arms, team = teachers)
      arms/[id]/           one arm (rows = pupils, team = its teachers)
    login/                 Kiddies Check credentials
    offline/               served by the service worker when a page isn't cached
    manifest.ts, icon.tsx, apple-icon.tsx, icons/[size]/   PWA manifest and icons
    providers.tsx          SWR (persisted cache) + auth + service worker registration
  components/
    Dashboard.tsx          composes one level: reads URL state, loads the view, wires panels
    layout/                TopBar (breadcrumbs, Day/Week/Term, prev/next), Drawer
    kpi/                   KpiPanel, KpiCard
    metric/                MetricView, RadialGauge, BarChart
    table/                 PerformanceBands, DataTable (search, sort, band filter)
    info/                  InfoPanel, Collapsible (map + Google Maps link at school level)
    ui/                    icons (inline SVG), loading / error / empty states
    brand/                 SpotlightMark (logo and app icon)
  lib/
    api/client.ts          the only fetch wrapper: token, timeout, typed ApiError, 401 handling
    api/types.ts           response types mirroring the Kiddies Check endpoints
    api/hooks.ts           useMe, useView, prefetchView, persisted SWR cache
    kpis.ts                KPI catalogue, targets, status colours, performance bands
    nav.ts                 URL state ↔ links
    auth.tsx               session context (login, logout, expiry)
public/sw.js               service worker
docs/API_MAPPING.md        view → endpoint mapping and the data Kiddies Check doesn't have
```

## KPIs and targets

| KPI | Meaning | Green | Amber | Red |
|---|---|---|---|---|
| Teachers: Assessment Records | Staff who recorded ≥ 1 assessment in the period, out of teaching staff plus anyone else who recorded (arm level: pupils assessed, out of pupils) | ≥ 75% | 50–74% | < 50% |
| Pupils: Present | Present or late, out of attendance records taken | ≥ 85% | 70–84% | < 70% |
| Pupils: Attendance Marked | Records taken, out of active pupils × working days | ≥ 90% | 70–89% | < 70% |

The performance bands also use an **Exceeds** threshold: 90%, 95% and 98% respectively. These targets are placeholders. Agree the real ones with the education team and change them in `src/lib/kpis.ts`; every card, gauge, bar and band follows that file.

Working days are Monday to Friday, minus holidays in the Kiddies Check academic calendar. Term and week numbers also come from that calendar.
