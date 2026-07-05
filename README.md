# AM777 Lead Command CRM

Private internal PWA dashboard for AM777 Automation Solutions — generate niche-based lead angles, track prospects, log outreach, manage follow-ups, and track deals/revenue. Everything runs client-side with `localStorage`; there is no backend yet.

**"I generate. I outreach. I earn."**

## Stack

React + Vite + Tailwind CSS + `vite-plugin-pwa`. No paid backend, no Supabase, no Google Sheets, no AI API — all lead-angle/offer/outreach generation is template-based string logic in `src/lib/templates.js`.

## Run locally

```bash
npm install
npm run dev
```

Open the printed local URL (default `http://localhost:5173`, or whatever port Vite picks).

## Build for production

```bash
npm run build
npm run preview   # serve the production build locally to sanity-check it
```

`npm run build` outputs to `dist/` and also generates the PWA service worker (`sw.js`) and `manifest.webmanifest` via `vite-plugin-pwa`.

## Deploy to Vercel

1. Push this folder to its own GitHub repo (or a subpath — see Vercel's "Root Directory" project setting if it's nested).
2. In Vercel: **New Project** → import the repo.
3. Framework preset: **Vite**. Build command: `npm run build`. Output directory: `dist`. (Vercel auto-detects these for a Vite project — you shouldn't need to override anything.)
4. Deploy. No environment variables are required for this MVP.

Routing note: the app uses `HashRouter` (URLs look like `/#/prospects`), specifically so it deploys cleanly as a static site with **zero server rewrite config** — no `vercel.json` needed. If you later switch to `BrowserRouter` for cleaner URLs, add a `vercel.json` rewrite (`{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }`) or client-side routes will 404 on refresh.

## Data model & storage

All data lives in the browser's `localStorage` under these keys (see `src/lib/storage.js`):

- `am777_prospects`
- `am777_outreach_logs`
- `am777_followups`
- `am777_deals`
- `am777_settings`
- `am777_templates`

Because it's `localStorage`, data is per-browser/per-device — it does not sync across devices and clearing browser data erases it. **Use Settings → Export Data regularly as a backup**; Import Data restores from that JSON file.

## Modules

| Page | Route | Purpose |
|---|---|---|
| Dashboard | `/` | Metric cards + today's follow-ups, hot prospects, recent outreach, recent deals |
| Lead Generator | `/lead-generator` | Pick niche/offer/pain point/tone/CTA → generates target profile, search keywords, qualification checklist, offer snippet, outreach snippet, follow-up snippet, CTA. Save as template or create a prospect directly. |
| Prospects CRM | `/prospects` | Add/edit/delete, search, filter by status/priority, sort, detail drawer with outreach/follow-up/deal actions, quick status update |
| Outreach Snippets | `/outreach` | Pick a saved prospect → generates a 5-stage message sequence (first outreach → proposal follow-up), editable/copyable, plus full outreach history with filters |
| Follow-Up Board | `/follow-ups` | Overdue / Due Today / Due This Week / Completed columns, mark done, reschedule, log outreach, move prospect status |
| Deals / Revenue | `/deals` | Add/edit/delete deals, pipeline/won/paid/unpaid revenue cards |
| Daily Command | `/daily` | Today's execution view — due/overdue follow-ups, hot prospects, prospects missing a next follow-up date, suggested actions, daily checklist |
| Settings | `/settings` | Brand name, owner name, default currency, n8n webhook URL placeholder, export/import/clear data |

## Automatic behavior (client-side, mirrors the eventual n8n logic)

- Adding a prospect auto-creates a first follow-up task (due in 2 days).
- Moving a prospect's status to **Follow-Up**, **Proposal Sent**, or **Booked Call** auto-creates the matching follow-up task type.
- Moving a prospect to **Won** auto-creates (or updates) a linked deal.
- Moving a prospect to **Lost** or **Not Fit** auto-skips any of its still-pending follow-ups.
- Deleting a prospect also removes its follow-up tasks (outreach logs and deals are left as historical records).

None of this is spam-adjacent automation — nothing sends a message on your behalf. Every outreach/offer/follow-up snippet is generated for you to review, edit, and send manually.

## Adding an n8n webhook later

`Settings` already has an `n8nWebhookUrl` field wired into `localStorage` (`am777_settings.n8nWebhookUrl`) so the UI is ready — it isn't called anywhere yet. When you're ready to add automation, the natural hook points are `addProspect`, `addOutreachLog`, and `updateProspectStatus` in `src/context/DataContext.jsx`: fire a `fetch(settings.n8nWebhookUrl, { method: 'POST', body: JSON.stringify(...) })` inside those functions once you have a real n8n instance to receive it.

## Known MVP limitations (by design — see V2 notes)

- Data is local to one browser only (no multi-device sync, no login).
- Icons are a single placeholder PNG reused for both 192px and 512px manifest entries — swap in real AM777 icon assets before treating the "installable app" experience as final.
- No Google Sheets / Supabase / paid API — everything is template-string based, per the build brief.
