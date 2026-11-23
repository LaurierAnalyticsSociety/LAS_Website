# Laurier Analytics Society (LAS) Website

Official marketing site for the **Laurier Analytics Society**, Wilfrid Laurier University’s student-run data community.

**Live:** [laurieranalytics.com](https://laurieranalytics.com) (hosted on Vercel; `www.laurieranalytics.com` redirects to the apex domain)

Single-page React app with a dark, terminal-inspired UI: hero, about, datathon, team, FAQ, newsletter, and sponsors.

## Stack

- **React 18** + **TypeScript**
- **Vite 5**
- **Tailwind CSS 3**
- **Framer Motion** (section reveals / motion)
- **Lenis** (smooth scrolling)
- **Lucide React** (icons)
- **Supabase**: Postgres + Edge Functions for newsletter / event-notification signups, unsubscribes, and sponsor inquiries
- **Resend**: transactional emails (welcome emails, sponsor inquiry notifications)
- **Vercel**: static hosting for the production site

## Getting started

```bash
npm install
cp .env.example .env   # then fill in the Supabase values
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

The newsletter and sponsor forms call Supabase Edge Functions, so the two
`VITE_` variables in `.env` must be set for them to work locally. See
[Backend](#backend-supabase) below.

| Script | Purpose |
|--------|---------|
| `npm run dev` | Local development server |
| `npm run build` | Production build → `dist/` (client bundle + prerendered HTML) |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint |

## Project layout

```
├── index.html              # HTML shell, SEO meta, Open Graph, JSON-LD
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── .env.example            # Template for local env vars (copy to .env)
├── public/                 # Static assets: images, favicon, robots.txt, sitemap.xml, webmanifest
├── src/
│   ├── index.tsx           # React entry
│   ├── App.tsx             # Page composition
│   ├── index.css           # Global styles
│   ├── data/site.ts        # All copy: nav, about, team, datathon, FAQs, socials
│   ├── hooks/              # Shared hooks (active section, cursor, typewriter, reduced motion)
│   ├── utils/supabase.ts   # Supabase client + subscribe() / submitSponsorInquiry()
│   └── components/         # Page sections + UI primitives
├── supabase/
│   ├── config.toml         # Function settings (JWT verification off)
│   ├── migrations/         # Table schema (signup tables, sponsor inquiries)
│   └── functions/
│       ├── subscribe/        # Edge Function: store signup + send welcome email
│       ├── sponsor-inquiry/  # Edge Function: store inquiry + notify the LAS inbox
│       └── unsubscribe/      # Edge Function: confirm page + unsubscribe on POST
└── ARCHITECTURE.md         # Structure and conventions
```

## Editing content

Almost all site copy lives in **`src/data/site.ts`**: nav links, about text, team, datathon years and tracks, FAQs, and socials. Prefer changing that file over hardcoding strings in components. Images live in `public/` (team photos in `public/team/`).

## Deployment

The production site is deployed to **Vercel** and served at
**https://laurieranalytics.com**.

- Build command: `npm run build`
- Output directory: `dist`
- Environment variables: set `VITE_SUPABASE_URL` and
  `VITE_SUPABASE_PUBLISHABLE_KEY` in the Vercel project settings (they are
  baked into the bundle at build time).

Edge Functions are deployed separately to Supabase (see below); a Vercel
deploy does not update them.

`vercel.json` sets long-lived caching for hashed `/assets/*` files and a
one-week cache for images.

## SEO

- **Prerendering:** `npm run build` also builds `src/entry-server.tsx` for
  SSR and runs `scripts/prerender.mjs`, which renders the page into
  `dist/index.html` so crawlers and link-preview bots see the full content
  without running JavaScript. The client then re-renders with `createRoot`
  (not hydration), so components don't need to produce identical server and
  client markup, but anything run during render must not touch `window` /
  `document` (keep that in effects).
- **No-JS / reduced motion:** the prerendered HTML starts with the intro
  overlay (`data-preloader`) and reveal animations at their hidden start
  state. Inline CSS in `index.html` hides the overlay for
  `prefers-reduced-motion` visitors, and a `<noscript>` style hides it and
  shows all content (including FAQ answers) when JavaScript is off.
- **Structured data:** Organization / WebSite / WebPage JSON-LD lives in
  `index.html`; the FAQPage JSON-LD is generated from `faqs` in
  `src/data/site.ts` at build time.
- **Metadata & assets:** title, description, canonical, Open Graph and Twitter
  tags are in `index.html`. The social preview image is `public/og-image.jpg`
  (1200×630). Icons: `favicon.svg`, `favicon-48.png`, `apple-touch-icon.png`,
  `icon-192.png`, `icon-512.png`.
- **Sitemap:** `public/sitemap.xml` (with image entries). `lastmod` is
  maintained by hand: bump it only when page content actually changes, so
  search engines keep trusting it.
- **Domain:** if the domain ever changes, update the URLs in `index.html`,
  `public/robots.txt` and `public/sitemap.xml`.
- After deploying, submit the sitemap in Google Search Console and Bing
  Webmaster Tools.

## Backend (Supabase)

### Signups (newsletter & "get notified")

```
Newsletter form → subscribe() (src/utils/supabase.ts)
                → Edge Function `subscribe`
                → insert into Postgres (service role, bypasses RLS)
                → Resend welcome email (only on a new signup)
```

### Sponsor inquiries

```
Sponsors form → submitSponsorInquiry() (src/utils/supabase.ts)
              → Edge Function `sponsor-inquiry`
              → insert into `sponsor_inquiries` (service role)
              → Resend notification email to SPONSOR_NOTIFY_TO
```

In both flows the database write is the source of truth: if the email send
fails, the row is still stored and the request still succeeds.

### Tables

Defined in `supabase/migrations/`. RLS is enabled with no public policies, so
the browser cannot read or write them directly; all writes go through the Edge
Functions using the service role.

| Table | Purpose |
|-------|---------|
| `newsletter_subscribers` | Biweekly newsletter signups (`email`, `status`, `source`, `unsubscribe_token`, timestamps) |
| `event_notifications` | "Notify me when applications open" signups (`email`, `event_key`, `source`) |
| `sponsor_inquiries` | Partnership inquiries (`company`, `contact_name`, `email`, `message`, `source`, `status`) |

See [Schema](#schema) for applying them.

### Environment variables

See `.env.example`.

| Variable | Where | Notes |
|----------|-------|-------|
| `VITE_SUPABASE_URL` | Browser (`.env` / Vercel) | Project URL, safe to expose |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Browser (`.env` / Vercel) | Publishable key, safe to expose |
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

### Deploying the functions

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

### Unsubscribe

Every newsletter welcome email has an unsubscribe link and
`List-Unsubscribe` / `List-Unsubscribe-Post` headers pointing at the
`unsubscribe` function. Opening the link (GET) only shows a confirm page,
because mail security scanners prefetch links; the subscriber's `status` is
set to `unsubscribed` only on POST, either from that page's button or from an
RFC 8058 one-click request sent by the mail client (Gmail, Yahoo, etc.).
Signing up again reactivates the row.

### Schema

Tables are defined in `supabase/migrations/`. The migrations
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
- The page title is static in `index.html`. FAQ structured data (JSON-LD) is generated at build time from `faqs` in `site.ts` by `scripts/prerender.mjs`, so it always matches the visible FAQ.
- Optional `App` props: `asciiDensity` (`'fine' | 'standard' | 'bold'`), `showIntro` (preloader, boolean), and `customCursor` (boolean). The intro is skipped when the user prefers reduced motion.

## License

Private student organization project. All rights reserved unless otherwise noted.
