-- Student login. Run once in the Supabase SQL editor (after schema.sql), THEN run students_seed.sql.
-- Same security model as schema.sql: RLS on, no policies, service-role access only.

-- The roster (bsp_allowlist) now also knows who each BSP belongs to.
alter table public.bsp_allowlist
  add column if not exists name text,       -- from the exam sheet; used to check the login email
  add column if not exists division text,
  add column if not exists email text;      -- college email, bound on first successful login

-- One mailbox can own only one BSP number.
create unique index if not exists bsp_allowlist_email_key
  on public.bsp_allowlist (email) where email is not null;

-- At most one pending login code per student (a new request replaces the old one).
create table if not exists public.login_codes (
  bsp text primary key references public.bsp_allowlist (bsp) on delete cascade,
  email text not null,
  code_hash text not null,                  -- HMAC, never the code itself
  expires_at timestamptz not null
);

alter table public.login_codes enable row level security;
revoke all on public.login_codes from anon, authenticated;
