# Laurier Analytics Society (LAS) Website

Official marketing site for the **Laurier Analytics Society** — Wilfrid Laurier University’s student-run data community.

Single-page React app with a dark, terminal-inspired UI: hero, about, impact, initiatives, team, datathon, sponsors, FAQ, and newsletter.

## Stack

- **React 18** + **TypeScript**
- **Vite 5**
- **Tailwind CSS 3**
- **Framer Motion** (section reveals / motion)
- **Lucide React** (icons)
- **Supabase** — Postgres + an Edge Function that stores newsletter / event-notification signups
- **Resend** — transactional welcome emails

## Getting started

```bash
npm install
cp .env.example .env   # then fill in the Supabase values
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

The newsletter form calls a Supabase Edge Function, so the two `VITE_`
variables in `.env` must be set for signups to work locally. See
[Newsletter & notifications](#newsletter--notifications-backend) below.

| Script | Purpose |
|--------|---------|
| `npm run dev` | Local development server |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint |

## Project layout

```
├── index.html              # HTML shell
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── .env.example            # Template for local env vars (copy to .env)
├── src/
│   ├── index.tsx           # React entry
│   ├── App.tsx             # Page composition
│   ├── index.css           # Global styles
│   ├── data/site.ts        # All copy, stats, team, FAQs, etc.
│   ├── hooks/              # Shared hooks (e.g. count-up)
│   ├── utils/supabase.ts   # Supabase client + subscribe() helper
│   └── components/         # Page sections + UI primitives
├── supabase/
│   └── functions/
│       ├── subscribe/        # Edge Function: store signup + send Resend email
│       ├── sponsor-inquiry/  # Edge Function: store inquiry + notify the LAS inbox
│       └── unsubscribe/      # Edge Function: newsletter unsubscribe link target
│   ├── migrations/           # Table schema (signup tables + sponsor_inquiries)
│   └── config.toml           # Function settings (JWT verification off)
└── ARCHITECTURE.md         # Structure and conventions
```

## Editing content

Almost all site copy lives in **`src/data/site.ts`** — nav links, about text, stats, impact charts, initiatives, team, datathon, sponsors, FAQs, and socials. Prefer changing that file over hardcoding strings in components.

## Newsletter & notifications (backend)

The newsletter form and the "get notified" flows are backed by Supabase.

**How a signup works**

```
Newsletter form → subscribe() (src/utils/supabase.ts)
                → Edge Function `subscribe`
                → insert into Postgres (service role, bypasses RLS)
                → Resend welcome email (only on a new signup)
```

The database write is the source of truth: if the email send fails, the
subscriber is still stored and the request still succeeds.

**Tables** (in the Supabase project, RLS enabled — the public site can only
INSERT, never read):

| Table | Purpose |
|-------|---------|
| `newsletter_subscribers` | Biweekly newsletter signups (`email`, `status`, `source`, `unsubscribe_token`, timestamps) |
| `event_notifications` | "Notify me when applications open" signups (`email`, `event_key`, `source`) |

**Environment variables** (see `.env.example`):

| Variable | Where | Notes |
|----------|-------|-------|
| `VITE_SUPABASE_URL` | Browser | Project URL — safe to expose |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Browser | Publishable key — safe to expose; RLS limits it to INSERT |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | **Never** commit or expose to the browser |
| `RESEND_API_KEY` | Edge Function secret | Set on the function, not read from `.env` at runtime |
| `RESEND_FROM` | Edge Function secret | Sender on a Resend-verified domain, e.g. `Laurier Analytics <hello@laurieranalytics.com>` |
| `SPONSOR_NOTIFY_TO` | Edge Function secret | Inbox for sponsor inquiries: `laurieranalytics@gmail.com` |
| `SITE_URL` | Edge Function secret | Optional. "Back to site" link on the unsubscribe page (defaults to `https://laurieranalytics.com`) |

`.env` is gitignored. The Edge Functions read `SUPABASE_URL` and
`SUPABASE_SERVICE_ROLE_KEY` automatically from the Supabase runtime; the rest
must be set as function secrets:

```bash
supabase secrets set --project-ref <project-ref> \
  RESEND_API_KEY=re_xxx \
  RESEND_FROM='Laurier Analytics <hello@laurieranalytics.com>' \
  SPONSOR_NOTIFY_TO=laurieranalytics@gmail.com
# or set them in Dashboard → Project Settings → Edge Functions
```

**Deploying the functions**

```bash
supabase functions deploy subscribe sponsor-inquiry unsubscribe --project-ref <project-ref>
```

`supabase/config.toml` turns off gateway JWT verification for all three
functions. The site calls them with the publishable key (`sb_publishable_…`),
which is not a JWT, and the unsubscribe link is opened straight from email.
With verification on, every request fails with 401.

> **Email deliverability:** without `RESEND_FROM`, mail is sent from
> `onboarding@resend.dev` and only reliably delivers to the Resend account
> owner (other addresses land in spam or don't arrive, but are still stored).
> Verify `laurieranalytics.com` in Resend (Domains → add the DNS records it
> lists), then set `RESEND_FROM` to an address on it.

**Unsubscribe.** Every newsletter welcome email has an unsubscribe link and
`List-Unsubscribe` headers pointing at the `unsubscribe` function, which sets
the subscriber's `status` to `unsubscribed`. Signing up again reactivates
the row.

**Schema.** Tables are defined in `supabase/migrations/`. The migrations
are idempotent, so they're safe to run against a project that already has
the tables:

```bash
supabase link --project-ref <project-ref>
supabase db push
```

### Restoring production (or moving to a new project)

1. Create (or restore) the Supabase project and note its project ref.
2. `supabase link --project-ref <ref>` then `supabase db push` to create the tables.
   If you're moving data from an old project, export `newsletter_subscribers`,
   `event_notifications` and `sponsor_inquiries` from it first and import them
   into the new one.
3. Set the function secrets above, then deploy all three functions.
4. In Vercel, set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`
   (Project Settings → API Keys) for Production, Preview and Development.
5. Redeploy on Vercel. `VITE_` vars are baked in at build time, so changing
   them does nothing until the next build.
6. Check that `https://<ref>.supabase.co` resolves, then submit a test
   newsletter signup and a test sponsor inquiry from the live site. Confirm the
   rows are in the tables, the welcome email and its unsubscribe link work, and
   the sponsor notification reaches the LAS inbox with Reply-To set to the
   submitter.

## Design notes

- Generated from a [Magic Patterns](https://www.magicpatterns.com/c/2a21qyqaumtbpafpn3qfba) design, then adapted for LAS.
- Dark theme is forced on `<html>` via `document.documentElement.classList.add('dark')` in `App`.
- Optional `App` props: `asciiDensity` (`'fine' | 'standard' | 'bold'`) and `showSponsors` (boolean).

## License

Private student organization project. All rights reserved unless otherwise noted.
