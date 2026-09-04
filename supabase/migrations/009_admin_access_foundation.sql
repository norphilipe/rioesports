-- ============================================================
-- RIO ESPORTS
-- Migration 009 - Platform administration access foundation
-- ============================================================

create type public.platform_admin_role as enum (
  'super_admin',
  'admin',
  'editor',
  'moderator'
);

create table public.platform_admins (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  role public.platform_admin_role not null default 'admin',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.platform_admins enable row level security;

create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.platform_admins pa
    where pa.profile_id = (select auth.uid())
      and pa.is_active = true
  );
$$;

grant execute on function public.is_platform_admin() to authenticated;

create policy "Users can view own platform admin role"
on public.platform_admins
for select
to authenticated
using ((select auth.uid()) = profile_id);

create policy "Platform admins can read platform admin assignments"
on public.platform_admins
for select
to authenticated
using ((select public.is_platform_admin()));

create policy "Platform admins can manage platform admin assignments"
on public.platform_admins
for all
to authenticated
using ((select public.is_platform_admin()))
with check ((select public.is_platform_admin()));

create policy "Platform admins can manage games"
on public.games
for all to authenticated
using ((select public.is_platform_admin()))
with check ((select public.is_platform_admin()));

create policy "Platform admins can manage game seasons"
on public.game_seasons
for all to authenticated
using ((select public.is_platform_admin()))
with check ((select public.is_platform_admin()));

create policy "Platform admins can manage player game profiles"
on public.player_game_profiles
for all to authenticated
using ((select public.is_platform_admin()))
with check ((select public.is_platform_admin()));

create policy "Platform admins can manage rating history"
on public.rating_history
for all to authenticated
using ((select public.is_platform_admin()))
with check ((select public.is_platform_admin()));

create policy "Platform admins can manage tournaments"
on public.tournaments
for all to authenticated
using ((select public.is_platform_admin()))
with check ((select public.is_platform_admin()));

create policy "Platform admins can manage matches"
on public.matches
for all to authenticated
using ((select public.is_platform_admin()))
with check ((select public.is_platform_admin()));

create policy "Platform admins can manage queue modes"
on public.queue_modes
for all to authenticated
using ((select public.is_platform_admin()))
with check ((select public.is_platform_admin()));

create policy "Platform admins can manage matchmaking queue entries"
on public.matchmaking_queue_entries
for all to authenticated
using ((select public.is_platform_admin()))
with check ((select public.is_platform_admin()));
