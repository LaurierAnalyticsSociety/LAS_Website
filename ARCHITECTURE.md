# Architecture

## Overview

This is a **static SPA** (Vite builds static assets) with one thin backend
concern: newsletter and event-notification signups, handled by a Supabase
Edge Function backed by Postgres. There is no other server, auth, or API
layer in-repo.

```
Browser → index.html → src/index.tsx → App → section components
                              ↑
                     src/data/site.ts (content)

Signup forms → src/utils/supabase.ts → Supabase Edge Function `subscribe`
                                    → Postgres + Resend email
```

## Runtime flow

1. `index.html` mounts `#root` and loads `src/index.tsx`.
2. `index.tsx` creates a React 18 root and renders `<App />`.
3. `App` enables dark mode, then stacks section components in order:
   - `Nav` → `Hero` → `About` → `Stats` → `Impact` → `Initiatives` → `Team` → `Datathon` → `Sponsors` (optional) → `Faq` → `Newsletter` → `Footer`
4. Sections pull structured data from `src/data/site.ts` and use shared UI (`Reveal`, `SectionHeading`, `AsciiField`, accordion).

## Key modules

| Path | Role |
|------|------|
| `src/App.tsx` | Page shell, density props, section order |
| `src/data/site.ts` | Single source of truth for marketing content |
| `src/components/AsciiField.tsx` | ASCII / matrix-style visual field used in hero & datathon |
| `src/components/Reveal.tsx` | Scroll / motion reveal wrapper |
| `src/hooks/useCountUp.ts` | Animated number counters for stats |
| `src/components/ui/Accordion.tsx` | FAQ accordion primitive |
| `src/components/Newsletter.tsx` | Newsletter section; submits via `subscribe()` |
| `src/utils/supabase.ts` | Supabase client + `subscribe()` helper (calls the Edge Function) |
| `supabase/functions/subscribe/index.ts` | Edge Function: validates, stores signup, sends Resend email |
| `src/_designSystem/` | Bundled design-system assets from the template (styles / library) |

## Signup backend

The Newsletter form (and future event-notification forms) post to a single
Supabase Edge Function rather than writing to the database directly. This
keeps the service-role key and the Resend key server-side.

**Flow**

1. `subscribe()` in `src/utils/supabase.ts` calls the `subscribe` Edge Function
   with `{ email, type, event_key?, source? }`.
2. The function validates the email, then inserts into `newsletter_subscribers`
   (type `newsletter`) or `event_notifications` (type `event`) using the
   service-role client, which bypasses RLS. Duplicate signups are treated as
   success (`already_subscribed`), not an error.
3. On a genuinely new signup it sends a welcome email via Resend. **The DB
   write is authoritative** — a failed email send does not fail the request.
   The response's `email_sent` flag tells the UI whether to say a
   confirmation went out.
4. Newsletter emails link to the `unsubscribe` function, which looks the
   subscriber up by `unsubscribe_token` and sets `status = 'unsubscribed'`.
   A later signup with the same email reactivates the row.

**Data model** (RLS enabled; the public `anon`/publishable key may only
INSERT, never SELECT — emails are never readable through the Data API):

| Table | Columns |
|-------|---------|
| `newsletter_subscribers` | `id`, `email` (unique, case-insensitive), `status`, `source`, `unsubscribe_token`, `created_at`, `confirmed_at`, `unsubscribed_at` |
| `event_notifications` | `id`, `email`, `event_key`, `source`, `created_at` — unique per `(email, event_key)` |

**Secrets:** the runtime injects `SUPABASE_URL` and
`SUPABASE_SERVICE_ROLE_KEY`; `RESEND_API_KEY` is a function secret. The
browser only ever sees the `VITE_` publishable values. See the README for
the full env-var table and deploy commands.

## Styling

- Tailwind utility classes in components; theme extensions in `tailwind.config.js`.
- Global tokens and base styles in `src/index.css`.
- Design-system CSS under `src/_designSystem/` may be imported by template tooling — treat as generated unless you intentionally customize it.

## Content vs presentation

- **Content** → `src/data/site.ts`
- **Layout / visuals** → `src/components/*`
- Avoid duplicating long copy inside components; import from `site.ts`.

## Build & deploy

- `npm run build` outputs to `dist/`.
- Suitable for static hosts (GitHub Pages, Vercel, Netlify, Cloudflare Pages). Set the host’s publish directory to `dist` and build command to `npm run build`.

## Out of scope (current)

- Auth, CMS, or CMS-driven content
- Server-side rendering
- Double opt-in (`confirmed_at` exists but isn't used yet)
- Sending newsletter broadcasts (only welcome emails are sent so far)
