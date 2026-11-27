# Architecture

## Overview

This is a **static SPA** (Vite builds static assets) deployed on **Vercel** at
[laurieranalytics.com](https://laurieranalytics.com). Its only backend
concerns are form submissions (newsletter / event-notification signups and
sponsor inquiries) and newsletter unsubscribes, handled by Supabase Edge Functions backed by Postgres.
There is no other server, auth, or API layer in-repo.

```
Browser → index.html → src/index.tsx → App → section components
                              ↑
                     src/data/site.ts (content)

Signup form  → src/utils/supabase.ts → Edge Function `subscribe`       → Postgres + Resend
Sponsor form → src/utils/supabase.ts → Edge Function `sponsor-inquiry` → Postgres + Resend
Email link   → Edge Function `unsubscribe` (confirm page, writes on POST) → Postgres
```

## Runtime flow

1. `index.html` mounts `#root`, carries static SEO metadata (canonical, Open Graph, Twitter, Organization / WebSite / WebPage JSON-LD), and loads `src/index.tsx`. In production builds `#root` already contains prerendered markup (see Build & deploy).
2. `index.tsx` creates a React 18 root and renders `<App />`.
3. `App` enables dark mode, shows the `Preloader` (unless disabled or reduced motion), and renders inside `SmoothScroll` (Lenis). The title is static in `index.html` and the FAQPage JSON-LD is added at build time by `scripts/prerender.mjs`:
   - `Nav` → `Hero` → `About` → `Datathon` → `Team` → `Faq` → `Newsletter` → `Sponsors` → `Footer`
4. Sections pull structured data from `src/data/site.ts` and use shared UI (`Reveal`, `WordReveal`, `SectionHeading`, `AsciiField`, accordion).

## Key modules

| Path | Role |
|------|------|
| `src/App.tsx` | Page shell, props (`asciiDensity`, `showIntro`, `customCursor`), section order |
| `src/entry-server.tsx` | SSR entry used only at build time: `render()` and FAQPage JSON-LD |
| `scripts/prerender.mjs` | Post-build step that bakes rendered HTML into both `dist/index.html` and `dist/workshops/index.html` |
| `vercel.json` | Cache and security headers |
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
| `supabase/functions/unsubscribe/index.ts` | Edge Function: confirm page on GET, unsubscribes on POST (incl. RFC 8058 one-click) |
| `supabase/config.toml` | Turns off gateway JWT verification for the three functions |
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
3. On a genuinely new signup it sends a welcome email via Resend. **The DB
   write is authoritative** — a failed email send does not fail the request.
   The response's `email_sent` flag tells the UI whether to say a
   confirmation went out.
4. Newsletter emails link to the `unsubscribe` function. GET is read-only:
   it validates the token (a UUID) and renders a confirm page whose form
   POSTs back to the same URL, so link-scanning bots can't unsubscribe
   anyone. POST sets `status = 'unsubscribed'`; a `List-Unsubscribe=One-Click`
   body (RFC 8058, from the mail client) gets an empty 200, the browser form
   gets the "unsubscribed" page. A later signup with the same email
   reactivates the row.

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
`SUPABASE_SERVICE_ROLE_KEY`; `RESEND_API_KEY`, `RESEND_FROM`,
`SPONSOR_NOTIFY_TO` and the optional `SITE_URL` are function secrets. The browser only ever sees the `VITE_` publishable values.
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

- `npm run build` outputs to `dist/` in three steps: the client bundle (`vite build`), an SSR bundle of `src/entry-server.tsx` (`dist-server/`, deleted afterwards), and `scripts/prerender.mjs`, which injects the rendered page and FAQPage JSON-LD into `dist/index.html`. The sitemap's `lastmod` is maintained by hand in `public/sitemap.xml`.
- The prerendered markup includes the intro overlay and hidden reveal states; `index.html` hides the overlay under `prefers-reduced-motion` and, via `<noscript>` CSS, hides it and shows all content when JavaScript is off.
- The client replaces the prerendered markup via `createRoot` rather than hydrating, so render-time code must be SSR-safe (no `window` / `document` outside effects) but server/client markup doesn't need to match.
- **Frontend:** hosted on Vercel, served at `https://laurieranalytics.com` (`www` redirects to the apex). Build command `npm run build`, output directory `dist`. `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` must be set in the Vercel project's environment variables.
- **Backend:** Edge Functions and migrations are deployed to Supabase with the Supabase CLI, independently of Vercel.
- Canonical, Open Graph, and JSON-LD URLs in `index.html`, plus `public/robots.txt` and `public/sitemap.xml`, must point at the production domain.

## Out of scope (current)

- Auth, CMS, or CMS-driven content
- Server-side rendering
- Double opt-in (`confirmed_at` exists but isn't used yet)
- Sending newsletter broadcasts (only welcome emails are sent so far)
