# Laurier Analytics Society (LAS) Website

Official marketing site for the **Laurier Analytics Society** — Wilfrid Laurier University’s student-run data community.

React site with a dark, terminal-inspired homepage and a separate workshop library at `/workshops/`.

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
│       └── subscribe/      # Edge Function: store signup + send Resend email
└── ARCHITECTURE.md         # Structure and conventions
```

## Editing content

Almost all site copy lives in **`src/data/site.ts`** — nav links, about text, stats, impact charts, initiatives, team, datathon, sponsors, FAQs, and socials. Prefer changing that file over hardcoding strings in components.

Workshop recordings also live in `src/data/site.ts`, in the `workshops` array. Add a title and YouTube video ID to list another recording. The workshops page reuses the site's navigation and footer; homepage section links return to the relevant homepage section. Vite builds both `index.html` and `workshops/index.html`, so the workshop URL can be loaded directly on static hosting.

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

`.env` is gitignored. The Edge Function reads `SUPABASE_URL` and
`SUPABASE_SERVICE_ROLE_KEY` automatically from the Supabase runtime;
`RESEND_API_KEY` must be set as a function secret:

```bash
supabase secrets set RESEND_API_KEY=re_xxx --project-ref <project-ref>
# or set it in Dashboard → Project Settings → Edge Functions
```

**Deploying the function**

```bash
supabase functions deploy subscribe
```

> **Email deliverability:** until a domain is verified in Resend, mail is
> sent from `onboarding@resend.dev` and only reliably delivers to the Resend
> account owner (other addresses land in spam or don't arrive, but are still
> stored). After verifying a domain, update `FROM_ADDRESS` in
> `supabase/functions/subscribe/index.ts` and redeploy.

> **Note:** the table schema currently lives in the Supabase project, not as
> a migration file in this repo. Run `supabase db pull` if you want it under
> version control.

## Design notes

- Generated from a [Magic Patterns](https://www.magicpatterns.com/c/2a21qyqaumtbpafpn3qfba) design, then adapted for LAS.
- Dark theme is forced on `<html>` via `document.documentElement.classList.add('dark')` in `App`.
- Optional `App` props: `asciiDensity` (`'fine' | 'standard' | 'bold'`) and `showSponsors` (boolean).

## License

Private student organization project. All rights reserved unless otherwise noted.
