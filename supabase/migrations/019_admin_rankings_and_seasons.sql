-- RIO ESPORTS
-- Migration 019 - Administrative rankings and season operations

-- Reconcile the application-facing admin predicate with the production function.
create or replace function public.is_current_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.is_platform_admin();
$$;
revoke all on function public.is_current_platform_admin() from public;
revoke execute on function public.is_current_platform_admin() from anon;
grant execute on function public.is_current_platform_admin() to authenticated;

create unique index if not exists game_seasons_one_active_per_game on public.game_seasons(game_id) where is_active;
create index if not exists player_game_profiles_ranking_lookup on public.player_game_profiles(game_id, mmr desc) where is_player = true;

create or replace function public.admin_create_game_season(target_game_id uuid, season_name text, starts_at_value timestamptz, ends_at_value timestamptz default null, activate_now boolean default false)
returns uuid language plpgsql security definer set search_path = public as $$
declare new_season_id uuid;
begin
  if not public.is_current_platform_admin() then raise exception 'platform admin required'; end if;
  if coalesce(trim(season_name), '') = '' then raise exception 'season name is required'; end if;
  if ends_at_value is not null and ends_at_value <= starts_at_value then raise exception 'season end must be after its start'; end if;
  if activate_now then update public.game_seasons set is_active = false where game_id = target_game_id and is_active; end if;
  insert into public.game_seasons (game_id, name, starts_at, ends_at, is_active) values (target_game_id, trim(season_name), starts_at_value, ends_at_value, activate_now) returning id into new_season_id;
  return new_season_id;
end;
$$;

create or replace function public.admin_set_game_season_active(target_season_id uuid, active_value boolean)
returns void language plpgsql security definer set search_path = public as $$
declare target_game_id uuid;
begin
  if not public.is_current_platform_admin() then raise exception 'platform admin required'; end if;
  select game_id into target_game_id from public.game_seasons where id = target_season_id;
  if target_game_id is null then raise exception 'season not found'; end if;
  if active_value then update public.game_seasons set is_active = false where game_id = target_game_id and is_active; end if;
  update public.game_seasons set is_active = active_value where id = target_season_id;
end;
$$;

create or replace function public.admin_game_snapshot()
returns table(game_id uuid, game_name text, is_active boolean)
language sql stable security definer set search_path = public as $$
  select g.id, g.name, g.is_active from public.games g where public.is_current_platform_admin() order by g.name;
$$;

create or replace function public.admin_ranking_snapshot(target_game_id uuid default null, result_limit integer default 100)
returns table(player_game_profile_id uuid, profile_id uuid, username text, display_name text, game_id uuid, game_name text, mmr integer, rank_name text, provisional boolean, wins integer, losses integer)
language sql stable security definer set search_path = public as $$
  select pgp.id, p.id, p.username, p.display_name, g.id, g.name, pgp.mmr, pgp.rank_name, pgp.provisional, pgp.wins, pgp.losses
  from public.player_game_profiles pgp join public.profiles p on p.id = pgp.profile_id join public.games g on g.id = pgp.game_id
  where public.is_current_platform_admin() and pgp.is_player = true and (target_game_id is null or pgp.game_id = target_game_id)
  order by pgp.mmr desc, pgp.wins desc, p.username asc
  limit greatest(1, least(coalesce(result_limit, 100), 500));
$$;

create or replace function public.admin_season_snapshot()
returns table(season_id uuid, game_id uuid, game_name text, name text, starts_at timestamptz, ends_at timestamptz, is_active boolean)
language sql stable security definer set search_path = public as $$
  select s.id, g.id, g.name, s.name, s.starts_at, s.ends_at, s.is_active from public.game_seasons s join public.games g on g.id = s.game_id where public.is_current_platform_admin() order by s.is_active desc, s.starts_at desc;
$$;

revoke all on function public.admin_create_game_season(uuid, text, timestamptz, timestamptz, boolean) from public;
revoke all on function public.admin_set_game_season_active(uuid, boolean) from public;
revoke all on function public.admin_game_snapshot() from public;
revoke all on function public.admin_ranking_snapshot(uuid, integer) from public;
revoke all on function public.admin_season_snapshot() from public;
revoke execute on function public.admin_create_game_season(uuid, text, timestamptz, timestamptz, boolean) from anon;
revoke execute on function public.admin_set_game_season_active(uuid, boolean) from anon;
revoke execute on function public.admin_game_snapshot() from anon;
revoke execute on function public.admin_ranking_snapshot(uuid, integer) from anon;
revoke execute on function public.admin_season_snapshot() from anon;
grant execute on function public.admin_create_game_season(uuid, text, timestamptz, timestamptz, boolean) to authenticated;
grant execute on function public.admin_set_game_season_active(uuid, boolean) to authenticated;
grant execute on function public.admin_game_snapshot() to authenticated;
grant execute on function public.admin_ranking_snapshot(uuid, integer) to authenticated;
grant execute on function public.admin_season_snapshot() to authenticated;
