-- ============================================================
-- RIO ESPORTS
-- Migration 002 - Harden foundation
-- ============================================================
-- This migration is incremental. Migration 001 remains the
-- canonical historical schema; this file only adds safeguards.

-- Client roles must not be able to rewrite server-owned rating,
-- trust or operational identity fields. Service-side jobs can use
-- the elevated service role when a system update is required.

create or replace function private.prevent_profile_operational_mutation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is not null then
    if new.id <> old.id
      or new.rio_id <> old.rio_id
      or new.is_active <> old.is_active
      or new.created_at <> old.created_at then
      raise exception 'operational profile fields are server managed';
    end if;
  end if;

  return new;
end;
$$;

revoke execute on function private.prevent_profile_operational_mutation() from public;
grant execute on function private.prevent_profile_operational_mutation() to authenticated;

drop trigger if exists profiles_prevent_operational_mutation on public.profiles;
create trigger profiles_prevent_operational_mutation
before update on public.profiles
for each row
execute function private.prevent_profile_operational_mutation();

create or replace function private.prevent_rating_mutation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is not null then
    if new.mmr <> old.mmr
      or new.rank_name is distinct from old.rank_name
      or new.provisional <> old.provisional
      or new.placement_matches <> old.placement_matches
      or new.wins <> old.wins
      or new.losses <> old.losses
      or new.created_at <> old.created_at then
      raise exception 'rating and statistics are server managed';
    end if;
  end if;

  return new;
end;
$$;

revoke execute on function private.prevent_rating_mutation() from public;
grant execute on function private.prevent_rating_mutation() to authenticated;

drop trigger if exists player_game_profiles_prevent_rating_mutation on public.player_game_profiles;
create trigger player_game_profiles_prevent_rating_mutation
before update on public.player_game_profiles
for each row
execute function private.prevent_rating_mutation();

-- Invitation recipients may respond, but may not rewrite the
-- invitation ownership, target team or assigned role.
create or replace function private.prevent_invitation_identity_mutation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is not null then
    if new.id <> old.id
      or new.team_id <> old.team_id
      or new.invited_profile_id <> old.invited_profile_id
      or new.invited_by <> old.invited_by
      or new.role <> old.role
      or new.created_at <> old.created_at then
      raise exception 'invitation identity fields are immutable';
    end if;
  end if;

  return new;
end;
$$;

revoke execute on function private.prevent_invitation_identity_mutation() from public;
grant execute on function private.prevent_invitation_identity_mutation() to authenticated;

drop trigger if exists team_invitations_prevent_identity_mutation on public.team_invitations;
create trigger team_invitations_prevent_identity_mutation
before update on public.team_invitations
for each row
execute function private.prevent_invitation_identity_mutation();

-- Defensive data constraints for future matchmaking and result ingestion.
alter table public.player_game_profiles
  drop constraint if exists player_game_profiles_nonnegative_stats;
alter table public.player_game_profiles
  add constraint player_game_profiles_nonnegative_stats
  check (mmr >= 0 and placement_matches >= 0 and wins >= 0 and losses >= 0);

alter table public.match_players
  drop constraint if exists match_players_nonnegative_stats;
alter table public.match_players
  add constraint match_players_nonnegative_stats
  check (kills >= 0 and deaths >= 0 and assists >= 0 and headshots >= 0);

alter table public.matches
  drop constraint if exists matches_valid_server_port;
alter table public.matches
  add constraint matches_valid_server_port
  check (server_port is null or server_port between 1 and 65535);

alter table public.tournaments
  drop constraint if exists tournaments_positive_max_teams;
alter table public.tournaments
  add constraint tournaments_positive_max_teams
  check (max_teams is null or max_teams > 0);

create index if not exists idx_player_game_profiles_active_mmr
  on public.player_game_profiles(game_id, mmr)
  where is_player = true;

create index if not exists idx_matches_game_status_created
  on public.matches(game_id, status, created_at desc);

create index if not exists idx_match_players_profile
  on public.match_players(profile_id, match_id);

create index if not exists idx_tournament_matches_tournament_round
  on public.tournament_matches(tournament_id, round_number, position);

-- No client policy is added for player_trust or rating_history.
-- With RLS enabled in migration 001, the absence of a matching
-- policy keeps these server-owned records inaccessible through
-- the publishable client.

-- Ensure the private schema is not exposed through the Data API.
revoke all on schema private from anon, authenticated;
