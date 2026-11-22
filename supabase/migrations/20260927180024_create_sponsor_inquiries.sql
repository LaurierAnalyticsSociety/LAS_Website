-- Sponsor / partnership inquiries submitted from the public website.
-- Write-only from the public site (same posture as the signup tables): rows are
-- inserted server-side by the sponsor-inquiry edge function using the service
-- role, and RLS blocks all direct client access.
create table if not exists public.sponsor_inquiries (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  contact_name text not null,
  email text not null,
  message text,
  source text,
  status text not null default 'new' check (status in ('new', 'contacted', 'archived')),
  created_at timestamptz not null default now()
);

comment on table public.sponsor_inquiries is
  'Partnership/sponsorship inquiries from the public site. Write-only from the public site; read via the service role.';

alter table public.sponsor_inquiries enable row level security;

-- Newest inquiries first when the team reviews them.
create index if not exists sponsor_inquiries_created_at_idx
  on public.sponsor_inquiries (created_at desc);
