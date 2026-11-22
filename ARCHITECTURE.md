# Architecture

## Overview

This is a **static SPA** (Vite builds static assets) deployed on **Vercel** at
[laurieranalytics.com](https://laurieranalytics.com). Its only backend
concerns are form submissions (newsletter / event-notification signups and
sponsor inquiries), handled by Supabase Edge Functions backed by Postgres.
There is no other server, auth, or API layer in-repo.

```
Browser → index.html → src/index.tsx → App → section components
                              ↑
                     src/data/site.ts (content)

Signup form  → src/utils/supabase.ts → Edge Function `subscribe`       → Postgres + Resend
Sponsor form → src/utils/supabase.ts → Edge Function `sponsor-inquiry` → Postgres + Resend
```

## Runtime flow

1. `index.html` mounts `#root`, carries static SEO metadata (canonical, Open Graph, Twitter, Organization / WebSite JSON-LD), and loads `src/index.tsx`.
2. `index.tsx` creates a React 18 root and renders `<App />`.
3. `App` enables dark mode, sets the document title, injects FAQ JSON-LD from `faqs`, shows the `Preloader` (unless disabled or reduced motion), and renders inside `SmoothScroll` (Lenis):
   - `Nav` → `Hero` → `About` → `Datathon` → `Team` → `Faq` → `Newsletter` → `Sponsors` → `Footer`
4. Sections pull structured data from `src/data/site.ts` and use shared UI (`Reveal`, `WordReveal`, `SectionHeading`, `AsciiField`, accordion).

## Key modules

| Path | Role |
|------|------|
| `src/App.tsx` | Page shell, props (`asciiDensity`, `showIntro`, `customCursor`), section order, FAQ JSON-LD |
| `src/data/site.ts` | Single source of truth for marketing content |
| `src/components/AsciiField.tsx` | ASCII / matrix-style visual field (uses `src/utils/heatmap.ts`) |
| `src/components/Preloader.tsx` | Intro animation shown before the hero |
| `src/components/SmoothScroll.tsx` | Lenis smooth-scroll wrapper |
| `src/components/CustomCursor.tsx` | Custom pointer (driven by `useCursorState`) |
| `src/components/Reveal.tsx`, `WordReveal.tsx` | Scroll / motion reveal wrappers |
| `src/components/ui/Accordion.tsx` | FAQ accordion primitive |
| `src/components/Newsletter.tsx` | Newsletter section; submits via `subscribe()` |
| `src/components/Sponsors.tsx` | Sponsors section + partnership inquiry form; submits via `submitSponsorInquiry()` |
| `src/hooks/` | `useActiveSection`, `useCursorState`, `useTypewriter`, `usePrefersReducedMotion`, `useCountUp` |
| `src/utils/supabase.ts` | Supabase client + `subscribe()` / `submitSponsorInquiry()` helpers |
| `supabase/functions/subscribe/index.ts` | Edge Function: validates, stores signup, sends welcome email |
| `supabase/functions/sponsor-inquiry/index.ts` | Edge Function: validates, stores inquiry, emails the team |
| `supabase/migrations/` | Schema for all backend tables |
| `public/` | Images, favicon, `robots.txt`, `sitemap.xml`, `site.webmanifest` |
| `src/_designSystem/` | Bundled design-system assets from the template (styles / library) |

## Backend

Forms post to Supabase Edge Functions rather than writing to the database
directly. This keeps the service-role key and the Resend key server-side.

**Signups (`subscribe`)**

1. `subscribe()` calls the function with `{ email, type, event_key?, source? }`.
2. The function validates the email, then inserts into `newsletter_subscribers`
   (type `newsletter`) or `event_notifications` (type `event`) using the
   service-role client, which bypasses RLS. Duplicate signups are treated as
   success (`already_subscribed`), not an error.
3. On a genuinely new signup it sends a welcome email via Resend.

**Sponsor inquiries (`sponsor-inquiry`)**

1. `submitSponsorInquiry()` calls the function with
   `{ company, contact_name, email, message?, source? }`.
2. The function validates input, inserts into `sponsor_inquiries`, and emails
   the inquiry to `SPONSOR_NOTIFY_TO` via Resend.
3. Response: `{ ok, stored, email_sent }`.

In both cases **the DB write is authoritative**: a failed email send does not
fail the request.

**Data model** (RLS enabled with no public policies; the browser can neither
read nor write these tables directly, so emails are never exposed via the Data
API):

| Table | Columns |
|-------|---------|
| `newsletter_subscribers` | `id`, `email` (unique, case-insensitive), `status`, `source`, `unsubscribe_token` (unique), `created_at`, `confirmed_at`, `unsubscribed_at` |
| `event_notifications` | `id`, `email`, `event_key`, `source`, `created_at`, unique per `(lower(email), event_key)` |
| `sponsor_inquiries` | `id`, `company`, `contact_name`, `email`, `message`, `source`, `status` (`new` / `contacted` / `archived`), `created_at` |

**Secrets:** the runtime injects `SUPABASE_URL` and
`SUPABASE_SERVICE_ROLE_KEY`; `RESEND_API_KEY` and `SPONSOR_NOTIFY_TO` are
function secrets. The browser only ever sees the `VITE_` publishable values.
See the README for the full env-var table and deploy commands.

## Styling

- Tailwind utility classes in components; theme extensions in `tailwind.config.js`.
- Global tokens and base styles in `src/index.css`.
- Design-system CSS under `src/_designSystem/` may be imported by template tooling; treat as generated unless you intentionally customize it.

## Content vs presentation

- **Content** → `src/data/site.ts`
- **Layout / visuals** → `src/components/*`
- Avoid duplicating long copy inside components; import from `site.ts`.

## Build & deploy

- `npm run build` outputs to `dist/`.
- **Frontend:** hosted on Vercel, served at `https://laurieranalytics.com` (`www` redirects to the apex). Build command `npm run build`, output directory `dist`. `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` must be set in the Vercel project's environment variables.
- **Backend:** Edge Functions and migrations are deployed to Supabase with the Supabase CLI, independently of Vercel.
- Canonical, Open Graph, and JSON-LD URLs in `index.html`, plus `public/robots.txt` and `public/sitemap.xml`, must point at the production domain.

## Out of scope (current)

- Auth, CMS, or CMS-driven content
- Server-side rendering
- Double opt-in / one-click unsubscribe flow (the `status` and
  `unsubscribe_token` columns exist for this but no unsubscribe function exists yet)
- Sending newsletter broadcasts (only welcome emails are sent so far)
- A verified Resend sending domain (uses `onboarding@resend.dev` for now)
