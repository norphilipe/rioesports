-- ============================================================
-- RIO ESPORTS
-- Migration 003 - Authentication profile integration
-- ============================================================

alter table public.profiles
  drop constraint if exists profiles_username_format;
alter table public.profiles
  add constraint profiles_username_format
  check (username ~ '^[a-z0-9_]{3,24}$');

alter table public.profiles
  drop constraint if exists profiles_display_name_length;
alter table public.profiles
  add constraint profiles_display_name_length
  check (char_length(display_name) between 1 and 80);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_username text;
  generated_username text;
  generated_display_name text;
begin
  requested_username := lower(trim(coalesce(new.raw_user_meta_data ->> 'username', '')));

  if requested_username ~ '^[a-z0-9_]{3,24}$' then
    generated_username := requested_username;
  else
    generated_username := 'player_' || substr(new.id::text, 1, 8);
  end if;

  if exists (select 1 from public.profiles where username = generated_username) then
    generated_username := 'player_' || substr(new.id::text, 1, 8);
  end if;

  generated_display_name := nullif(trim(coalesce(new.raw_user_meta_data ->> 'display_name', '')), '');
  generated_display_name := left(coalesce(generated_display_name, generated_username), 80);

  insert into public.profiles (id, username, display_name)
  values (new.id, generated_username, generated_display_name);

  insert into public.player_trust (profile_id)
  values (new.id)
  on conflict (profile_id) do nothing;

  return new;
end;
$$;

-- A signed-in user must always be able to read the own profile,
-- including a profile temporarily marked inactive by moderation.
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

-- Keep public profile reads limited to active accounts.
-- The existing update policy and trigger protections remain in force.
