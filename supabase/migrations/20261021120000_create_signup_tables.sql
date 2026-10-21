-- Newsletter and event-notification signups from the public website.
-- These tables were originally created in the Supabase dashboard; this
-- migration captures them so a replacement project can be stood up from the
-- repo. Every statement is idempotent, so it is safe on a project that already
-- has the tables.
--
-- Same posture as sponsor_inquiries: rows are written server-side by the
-- subscribe / unsubscribe edge functions using the service role, and RLS blocks
-- all direct client access.

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  status text not null default 'subscribed',
  source text,
  unsubscribe_token uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now(),
  confirmed_at timestamptz,
  unsubscribed_at timestamptz
);

comment on table public.newsletter_subscribers is
  'Biweekly newsletter signups. Write-only from the public site; read via the service role.';

-- One row per address regardless of case.
create unique index if not exists newsletter_subscribers_email_key
  on public.newsletter_subscribers (lower(email));

-- Looked up by the unsubscribe function.
create unique index if not exists newsletter_subscribers_unsubscribe_token_key
  on public.newsletter_subscribers (unsubscribe_token);

alter table public.newsletter_subscribers enable row level security;

create table if not exists public.event_notifications (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  event_key text not null,
  source text,
  created_at timestamptz not null default now()
);

comment on table public.event_notifications is
  '"Notify me when applications open" signups. Write-only from the public site; read via the service role.';

create unique index if not exists event_notifications_email_event_key
  on public.event_notifications (lower(email), event_key);

alter table public.event_notifications enable row level security;
