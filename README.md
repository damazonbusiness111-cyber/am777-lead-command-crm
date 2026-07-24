# AM777 Lead Command CRM

Private internal PWA dashboard for AM777 Automation Solutions — track leads, move deals through a pipeline, run daily follow-ups with a Gmail-ready composer, and track revenue. Backed by Supabase (Postgres) so data is real, online, and shared across every device you sign into.

## Stack

React + React Router + Vite + Tailwind CSS + `vite-plugin-pwa` + Supabase (Postgres + Auth, incl. Google OAuth) + Recharts (lazy-loaded, Dashboard graph only). Lead-angle/offer/outreach generation is still template-based string logic in `src/lib/templates.js` and `src/lib/emailTemplates.js` — no AI API, no scraping. `npm run lint` runs ESLint (flat config, `eslint.config.js`).

## One-time Supabase setup

1. Create a free project at [supabase.com](https://supabase.com) (you'll need your own account — this can't be automated on your behalf).
2. In the project's **SQL Editor**, paste and run [`supabase/schema.sql`](supabase/schema.sql). It creates all 6 tables and turns on Row Level Security so only a signed-in user can read/write anything.
3. Create your one admin login: **Authentication → Users → Add user** (email + password). There is no public sign-up form in this app on purpose — accounts are only ever created by you, in the dashboard.
4. Grab your keys from **Project Settings → API**: the **Project URL** and the **anon public** key (not the `service_role` key — that one must never end up in frontend code).

## Run locally

```bash
cp .env.example .env.local   # then fill in your Supabase URL + anon key
npm install
npm run dev
```

Open the printed local URL and sign in with the admin user you created in Supabase.

## Build for production

```bash
npm run build
npm run preview   # serve the production build locally to sanity-check it
```

`npm run build` outputs to `dist/` and also generates the PWA service worker (`sw.js`) and `manifest.webmanifest` via `vite-plugin-pwa`.

## Deploy to Vercel

1. Push this folder to its own GitHub repo.
2. In Vercel: **New Project** → import the repo. Framework preset **Vite** is auto-detected (build command `npm run build`, output `dist`).
3. Before deploying, add the environment variables from your `.env.local` to the Vercel project (**Settings → Environment Variables**): `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Without these the deployed app will show a console warning and every Supabase call will fail.
4. Deploy.

Routing note: the app uses `HashRouter` (URLs look like `/#/prospects`), specifically so it deploys cleanly as a static site with **zero server rewrite config** — no `vercel.json` needed.

## Data model & storage

Six Postgres tables (see `supabase/schema.sql`): `prospects`, `outreach_logs`, `followups`, `deals`, `templates`, and a single-row `settings` table. The app maps camelCase JS objects to snake_case columns in `src/lib/supabaseMappers.js` — pages never talk to Supabase directly, only through `src/context/DataContext.jsx`.

**Auth model:** every table requires `auth.role() = 'authenticated'` (see the RLS policies at the bottom of `schema.sql`) — there's no per-row ownership check, since this is a single-admin app, not multi-tenant. Anyone signed in can read/write everything. Because the Supabase anon key is embedded in the frontend bundle (unavoidable for any client-side Supabase app), **the login gate is the actual security boundary here, not the key** — don't disable RLS or add a public sign-up flow without re-thinking that.

**Backups:** Settings → Export Data downloads a full JSON snapshot of all 6 tables; Import Data upserts a backup file back in. Worth doing occasionally even with a real database behind it.

## Modules

| Page | Route | Purpose |
|---|---|---|
| Dashboard | `/` | 4 key metrics, Priority (recommended) Actions, an optional Revenue Trend / Leads by Status graph, Pipeline Snapshot, Recent Leads/Follow-ups/Revenue — sections are toggleable in Settings → Dashboard |
| Leads | `/leads` | Searchable lead table, status/priority filters, CSV import, detail drawer (outreach history, follow-up, deal), plus an in-page Lead Angle Tool for template-based prospecting angles |
| Pipeline | `/pipeline` | Kanban-style board, New → Won/Lost, move a lead's stage via its card menu |
| Follow-ups | `/follow-ups` | Today / Overdue / Upcoming / Completed tabs; one contextual primary action per lead (Send First Email, Follow Up, etc.), swipe-to-complete on touch devices, overflow menu for Reschedule/Note/Skip/Move Status |
| Revenue | `/revenue` | Pipeline value, won/paid/unpaid totals, deal table, collapsible detailed analytics |
| Integrations | `/integrations` | Visual connection cards (Gmail, forms, n8n, Zapier/Make, webhooks, etc.) with honest, verified-only status; API keys/webhooks/logs live under the collapsed Advanced Tools section |
| Settings | `/settings` | General, Dashboard (section visibility), Email, Automation, Templates (preview), Data (export/import), Advanced (account/sign out) |

A floating Quick Actions button (bottom-right) jumps straight to the most urgent follow-up or opens the Lead Angle Tool — template-based, not AI-backed.

### Gmail-ready follow-ups

Sending an email never happens inside the app. The composer drawer builds a subject/body from a template, personalized with the lead's real data, and "Open in Gmail" opens `mail.google.com`'s compose view prefilled via `src/lib/gmailCompose.js` — a signed-in user reviews and hits send themselves. Nothing is logged as sent until you click **Mark Sent & Complete** afterward. Google sign-in (`signInWithOAuth`) requires enabling the Google provider in Supabase's Auth settings first.

## Automatic behavior (mirrors the eventual n8n logic)

- Adding a prospect auto-creates a first follow-up task (due in 2 days).
- Moving a prospect's status to **Follow-Up**, **Proposal Sent**, or **Booked Call** auto-creates the matching follow-up task type.
- Moving a prospect to **Won** auto-creates (or updates) a linked deal.
- Moving a prospect to **Lost** or **Not Fit** auto-skips any of its still-pending follow-ups.
- Deleting a prospect also removes its follow-up tasks (outreach logs and deals are left as historical records).

None of this is spam-adjacent automation — nothing sends a message on your behalf. Every outreach/offer/follow-up snippet is generated for you to review, edit, and send manually.

## Adding an n8n webhook later

`Settings` has an `n8nWebhookUrl` field (stored in the `settings` table) so the UI is ready — it isn't called anywhere yet. The natural hook points are `addProspect`, `addOutreachLog`, and `updateProspectStatus` in `src/context/DataContext.jsx`: fire a `fetch(settings.n8nWebhookUrl, { method: 'POST', body: JSON.stringify(...) })` inside those functions once you have a real n8n instance to receive it.

## Known MVP limitations (by design — see V2 notes)

- Single shared admin login — no per-user permissions or multi-seat access yet. Fine for a one-operator agency tool; revisit if VAs need their own restricted logins.
- Icons are a single placeholder PNG reused for both 192px and 512px manifest entries — swap in real AM777 icon assets before treating the "installable app" experience as final.
- No AI API, no scraping — lead angles and snippets are template-string based, per the build brief.
