-- ============================================================
-- RIO ESPORTS
-- Migration 003 - Platform hardening
-- ============================================================
-- Incremental security and integrity safeguards. Historical
-- migrations remain immutable.

-- ----------------------------------------------------------------
-- Internal trigger functions must not be callable through the
-- public API. PostgreSQL triggers continue to execute these functions
-- even when EXECUTE is revoked from client roles.
-- ----------------------------------------------------------------
revoke all on function public.handle_new_user() from public;
revoke all on function public.handle_new_user() from anon;
revoke all on function public.handle_new_user() from authenticated;

revoke all on function public.add_team_creator_as_admin() from public;
revoke all on function public.add_team_creator_as_admin() from anon;
revoke all on function public.add_team_creator_as_admin() from authenticated;

-- ----------------------------------------------------------------
-- Timestamp integrity
-- ----------------------------------------------------------------
create or replace function private.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function private.set_updated_at() from public;
revoke all on function private.set_updated_at() from anon;
revoke all on function private.set_updated_at() from authenticated;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function private.set_updated_at();

drop trigger if exists player_trust_set_updated_at on public.player_trust;
create trigger player_trust_set_updated_at
before update on public.player_trust
for each row execute function private.set_updated_at();

drop trigger if exists player_game_profiles_set_updated_at on public.player_game_profiles;
create trigger player_game_profiles_set_updated_at
before update on public.player_game_profiles
for each row execute function private.set_updated_at();

drop trigger if exists teams_set_updated_at on public.teams;
create trigger teams_set_updated_at
before update on public.teams
for each row execute function private.set_updated_at();

drop trigger if exists tournaments_set_updated_at on public.tournaments;
create trigger tournaments_set_updated_at
before update on public.tournaments
for each row execute function private.set_updated_at();

-- ----------------------------------------------------------------
-- Referential and temporal integrity
-- ----------------------------------------------------------------
alter table public.rating_history
  drop constraint if exists rating_history_match_id_fkey;
alter table public.rating_history
  add constraint rating_history_match_id_fkey
  foreign key (match_id) references public.matches(id) on delete set null;

alter table public.game_seasons
  drop constraint if exists game_seasons_valid_dates;
alter table public.game_seasons
  add constraint game_seasons_valid_dates
  check (ends_at is null or ends_at > starts_at);

create unique index if not exists idx_game_seasons_one_active_per_game
  on public.game_seasons(game_id)
  where is_active = true;

alter table public.tournaments
  drop constraint if exists tournaments_valid_registration_window;
alter table public.tournaments
  add constraint tournaments_valid_registration_window
  check (
    registration_start is null
    or registration_end is null
    or registration_end >= registration_start
  );

alter table public.tournaments
  drop constraint if exists tournaments_start_after_registration;
alter table public.tournaments
  add constraint tournaments_start_after_registration
  check (
    start_at is null
    or registration_end is null
    or start_at >= registration_end
  );

-- ----------------------------------------------------------------
-- Foreign-key indexes for common joins and integrity checks
-- ----------------------------------------------------------------
create index if not exists idx_rating_history_player_game_profile
  on public.rating_history(player_game_profile_id);

create index if not exists idx_rating_history_season
  on public.rating_history(season_id);

create index if not exists idx_rating_history_match
  on public.rating_history(match_id)
  where match_id is not null;

create index if not exists idx_reports_reporter
  on public.reports(reporter_id);

create index if not exists idx_reports_reported_profile
  on public.reports(reported_profile_id);

create index if not exists idx_reports_match
  on public.reports(match_id)
  where match_id is not null;

create index if not exists idx_penalties_profile
  on public.penalties(profile_id);

create index if not exists idx_penalties_issued_by
  on public.penalties(issued_by)
  where issued_by is not null;

create index if not exists idx_teams_game
  on public.teams(game_id);

create index if not exists idx_teams_created_by
  on public.teams(created_by);

create index if not exists idx_teams_owner
  on public.teams(owner_id)
  where owner_id is not null;

create index if not exists idx_tournaments_game
  on public.tournaments(game_id);

create index if not exists idx_tournaments_created_by
  on public.tournaments(created_by);

create index if not exists idx_tournament_teams_team
  on public.tournament_teams(team_id);

create index if not exists idx_tournament_matches_match
  on public.tournament_matches(match_id);

create index if not exists idx_tournament_matches_next_winner
  on public.tournament_matches(next_winner_match_id)
  where next_winner_match_id is not null;

create index if not exists idx_tournament_matches_next_loser
  on public.tournament_matches(next_loser_match_id)
  where next_loser_match_id is not null;

-- ----------------------------------------------------------------
-- Explicitly document server-owned tables at the SQL privilege layer.
-- RLS remains enabled; no client policies are introduced here.
-- ----------------------------------------------------------------
revoke all on table public.player_trust from anon;
revoke all on table public.rating_history from anon;
revoke all on table public.penalties from anon;
revoke all on table public.player_identities from anon;
