-- ============================================================
-- RIO ESPORTS
-- Migration 009 - Platform administration and tournament operations
-- ============================================================

-- Platform administration is intentionally separate from team roles.
-- A team administrator must not automatically gain access to the
-- global RIO ESPORTS administration area.

create table if not exists public.platform_admins (
  profile_id uuid primary key
    references public.profiles(id)
    on delete cascade,

  role text not null default 'admin'
    check (role in ('admin', 'super_admin')),

  created_at timestamptz not null default now()
);

alter table public.platform_admins enable row level security;

-- No direct client policies are created for this table. Membership is
-- managed by the database owner/service role only.

create or replace function private.is_platform_admin(
  p_profile_id uuid default (select auth.uid())
)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1
    from public.platform_admins pa
    where pa.profile_id = p_profile_id
  );
$$;

revoke all on function private.is_platform_admin(uuid) from public, anon, authenticated;
grant usage on schema private to authenticated;
grant execute on function private.is_platform_admin(uuid) to authenticated;

create or replace function public.is_current_platform_admin()
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select private.is_platform_admin((select auth.uid()));
$$;

revoke all on function public.is_current_platform_admin() from public, anon;
grant execute on function public.is_current_platform_admin() to authenticated;

-- Platform administrators need visibility of every tournament, including
-- drafts created by other administrators.
create policy "Platform admins can view all tournaments"
on public.tournaments
for select
to authenticated
using ((select private.is_platform_admin((select auth.uid()))));

create policy "Platform admins can create tournaments"
on public.tournaments
for insert
to authenticated
with check (
  created_by = (select auth.uid())
  and (select private.is_platform_admin((select auth.uid())))
);

create policy "Platform admins can update tournaments"
on public.tournaments
for update
to authenticated
using ((select private.is_platform_admin((select auth.uid()))))
with check ((select private.is_platform_admin((select auth.uid()))));

create policy "Platform admins can delete tournaments"
on public.tournaments
for delete
to authenticated
using ((select private.is_platform_admin((select auth.uid()))));

grant select, insert, update, delete on public.tournaments to authenticated;

-- Tournament teams are operational data. Platform administrators can
-- manage registration/check-in state and seeds.
create policy "Platform admins can manage tournament teams"
on public.tournament_teams
for all
to authenticated
using ((select private.is_platform_admin((select auth.uid()))))
with check ((select private.is_platform_admin((select auth.uid()))));

grant insert, update, delete on public.tournament_teams to authenticated;

-- ============================================================
-- ADMIN BOOTSTRAP
-- ============================================================
-- Add the first administrator manually from the Supabase SQL editor:
--
-- insert into public.platform_admins (profile_id, role)
-- select id, 'super_admin'
-- from public.profiles
-- where username = '<your-username>';
--
-- The platform_admins table is not writable by normal authenticated users.
