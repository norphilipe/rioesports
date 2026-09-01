-- Platform hardening migration
-- Consolidated from feat/platform-hardening onto the current authenticated foundation.

begin;

-- Security baseline: keep profile rows tied to authenticated users and enable RLS.
alter table if exists public.profiles enable row level security;

-- Users may read and update only their own profile.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select to authenticated
  using (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Defensive trigger function for future team membership changes.
create or replace function public.current_user_is_team_member(target_team_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.team_members tm
    where tm.team_id = target_team_id
      and tm.user_id = auth.uid()
  );
$$;

revoke all on function public.current_user_is_team_member(uuid) from public;
grant execute on function public.current_user_is_team_member(uuid) to authenticated;

commit;
