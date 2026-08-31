-- ============================================================
-- RIO ESPORTS
-- Migration 001 - Initial Schema
-- ============================================================

create extension if not exists "pgcrypto";

-- ============================================================
-- PRIVATE SCHEMA
-- Funções internas utilizadas pelo RLS.
-- ============================================================

create schema if not exists private;

-- ============================================================
-- ENUMS
-- ============================================================

create type public.team_member_role as enum (
  'owner',
  'manager',
  'coach',
  'player'
);

create type public.team_member_status as enum (
  'active',
  'invited',
  'left',
  'removed'
);

create type public.match_status as enum (
  'pending',
  'ready',
  'live',
  'finished',
  'cancelled'
);

create type public.tournament_status as enum (
  'draft',
  'registration',
  'checkin',
  'running',
  'finished',
  'cancelled'
);

create type public.tournament_format as enum (
  'single_elimination',
  'double_elimination',
  'round_robin',
  'swiss',
  'groups_playoffs'
);

-- ============================================================
-- PROFILES
--
-- Um usuário da RIO ESPORTS NÃO é obrigatoriamente jogador.
-- ============================================================

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,

  rio_id bigint generated always as identity unique,

  username text not null unique,
  display_name text not null,

  avatar_url text,
  bio text,

  country_code text not null default 'BR',
  state_code text default 'RJ',
  city text,

  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- PLAYER IDENTITIES
--
-- Identidades externas vinculadas ao usuário.
--
-- A combinação provider + provider_user_id é única.
-- Isso impede que a mesma identidade Steam seja vinculada
-- a duas contas diferentes da RIO ESPORTS.
-- ============================================================

create table public.player_identities (
  id uuid primary key default gen_random_uuid(),

  profile_id uuid not null
    references public.profiles(id)
    on delete cascade,

  provider text not null,
  provider_user_id text not null,
  provider_username text,

  account_created_at timestamptz,

  is_verified boolean not null default false,

  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),

  unique(provider, provider_user_id),
  unique(profile_id, provider)
);

-- ============================================================
-- PLAYER TRUST
--
-- Base inicial para o sistema anti-smurf / confiança.
-- ============================================================

create table public.player_trust (
  profile_id uuid primary key
    references public.profiles(id)
    on delete cascade,

  trust_score integer not null default 0
    check (trust_score between 0 and 100),

  multi_account_risk integer not null default 0
    check (multi_account_risk between 0 and 100),

  review_required boolean not null default false,

  review_status text not null default 'none'
    check (
      review_status in (
        'none',
        'pending',
        'reviewed',
        'restricted'
      )
    ),

  account_age_days integer,

  steam_account_age_days integer,
  steam_cs_hours numeric(10,2),

  matches_played integer not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- GAMES
-- ============================================================

create table public.games (
  id uuid primary key default gen_random_uuid(),

  slug text not null unique,
  name text not null,
  short_name text not null,

  description text,

  is_active boolean not null default false,

  created_at timestamptz not null default now()
);

-- ============================================================
-- GAME SEASONS
-- ============================================================

create table public.game_seasons (
  id uuid primary key default gen_random_uuid(),

  game_id uuid not null
    references public.games(id)
    on delete cascade,

  name text not null,

  starts_at timestamptz not null,
  ends_at timestamptz,

  is_active boolean not null default false,

  created_at timestamptz not null default now(),

  unique(game_id, name)
);

-- ============================================================
-- PLAYER GAME PROFILES
--
-- O usuário pode ser jogador em um jogo e não ser jogador
-- em outro.
-- ============================================================

create table public.player_game_profiles (
  id uuid primary key default gen_random_uuid(),

  profile_id uuid not null
    references public.profiles(id)
    on delete cascade,

  game_id uuid not null
    references public.games(id)
    on delete cascade,

  is_player boolean not null default false,

  mmr integer not null default 1000,

  rank_name text,

  provisional boolean not null default true,

  placement_matches integer not null default 0,

  wins integer not null default 0,
  losses integer not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique(profile_id, game_id)
);

-- ============================================================
-- RATING HISTORY
-- ============================================================

create table public.rating_history (
  id uuid primary key default gen_random_uuid(),

  player_game_profile_id uuid not null
    references public.player_game_profiles(id)
    on delete cascade,

  season_id uuid
    references public.game_seasons(id)
    on delete set null,

  match_id uuid,

  previous_mmr integer not null,
  new_mmr integer not null,
  change integer not null,

  reason text,

  created_at timestamptz not null default now()
);

-- ============================================================
-- TEAMS
--
-- OWNER é opcional.
-- MANAGER é opcional.
-- COACH é opcional.
--
-- A equipe pode ser composta apenas por jogadores.
--
-- created_by identifica quem criou a equipe.
-- owner_id representa propriedade formal e pode ser NULL.
-- ============================================================

create table public.teams (
  id uuid primary key default gen_random_uuid(),

  game_id uuid not null
    references public.games(id),

  name text not null,
  tag text,

  logo_url text,
  description text,

  created_by uuid not null
    references public.profiles(id)
    on delete restrict,

  owner_id uuid
    references public.profiles(id)
    on delete set null,

  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique(game_id, name)
);

-- ============================================================
-- TEAM MEMBERS
--
-- role:
--
-- OWNER   = Proprietário
-- MANAGER = Gestor
-- COACH   = Treinador
-- PLAYER  = Jogador
--
-- is_admin é uma PERMISSÃO separada do cargo.
--
-- Portanto:
--
-- PLAYER + ADMIN
-- COACH + ADMIN
-- MANAGER + ADMIN
-- OWNER + ADMIN
--
-- Podem existir vários administradores.
-- ============================================================

create table public.team_members (
  id uuid primary key default gen_random_uuid(),

  team_id uuid not null
    references public.teams(id)
    on delete cascade,

  profile_id uuid not null
    references public.profiles(id)
    on delete cascade,

  role public.team_member_role not null default 'player',

  is_admin boolean not null default false,

  status public.team_member_status not null default 'active',

  joined_at timestamptz not null default now(),
  left_at timestamptz,

  unique(team_id, profile_id)
);

-- ============================================================
-- TEAM INVITATIONS
-- ============================================================

create table public.team_invitations (
  id uuid primary key default gen_random_uuid(),

  team_id uuid not null
    references public.teams(id)
    on delete cascade,

  invited_profile_id uuid not null
    references public.profiles(id)
    on delete cascade,

  invited_by uuid not null
    references public.profiles(id)
    on delete restrict,

  role public.team_member_role not null default 'player',

  status text not null default 'pending'
    check (
      status in (
        'pending',
        'accepted',
        'declined',
        'cancelled'
      )
    ),

  created_at timestamptz not null default now(),
  responded_at timestamptz
);

-- ============================================================
-- MATCHES
-- ============================================================

create table public.matches (
  id uuid primary key default gen_random_uuid(),

  game_id uuid not null
    references public.games(id),

  match_type text not null default 'matchmaking'
    check (
      match_type in (
        'matchmaking',
        'tournament',
        'custom'
      )
    ),

  status public.match_status not null default 'pending',

  best_of integer not null default 1
    check (best_of in (1, 3, 5)),

  map_name text,

  server_provider text not null default 'xplay',

  server_address text,
  server_port integer,

  external_match_id text,

  started_at timestamptz,
  finished_at timestamptz,

  created_at timestamptz not null default now()
);

-- ============================================================
-- MATCH PLAYERS
-- ============================================================

create table public.match_players (
  id uuid primary key default gen_random_uuid(),

  match_id uuid not null
    references public.matches(id)
    on delete cascade,

  profile_id uuid not null
    references public.profiles(id)
    on delete restrict,

  team_side text not null
    check (team_side in ('team_a', 'team_b')),

  kills integer not null default 0,
  deaths integer not null default 0,
  assists integer not null default 0,

  headshots integer not null default 0,

  score integer,

  won boolean,

  mmr_before integer,
  mmr_after integer,

  created_at timestamptz not null default now(),

  unique(match_id, profile_id)
);

-- ============================================================
-- MATCH TEAMS
-- ============================================================

create table public.match_teams (
  id uuid primary key default gen_random_uuid(),

  match_id uuid not null
    references public.matches(id)
    on delete cascade,

  team_id uuid
    references public.teams(id)
    on delete set null,

  side text not null
    check (side in ('team_a', 'team_b')),

  score integer not null default 0,

  won boolean,

  unique(match_id, side)
);

-- ============================================================
-- TOURNAMENTS
-- ============================================================

create table public.tournaments (
  id uuid primary key default gen_random_uuid(),

  game_id uuid not null
    references public.games(id),

  created_by uuid not null
    references public.profiles(id)
    on delete restrict,

  name text not null,
  slug text not null unique,

  description text,

  format public.tournament_format not null,

  status public.tournament_status not null default 'draft',

  max_teams integer,

  best_of integer not null default 1
    check (best_of in (1, 3, 5)),

  registration_start timestamptz,
  registration_end timestamptz,

  start_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- TOURNAMENT TEAMS
-- ============================================================

create table public.tournament_teams (
  id uuid primary key default gen_random_uuid(),

  tournament_id uuid not null
    references public.tournaments(id)
    on delete cascade,

  team_id uuid not null
    references public.teams(id)
    on delete restrict,

  seed integer,

  status text not null default 'registered'
    check (
      status in (
        'registered',
        'checked_in',
        'eliminated',
        'winner'
      )
    ),

  registered_at timestamptz not null default now(),

  unique(tournament_id, team_id)
);

-- ============================================================
-- TOURNAMENT MATCHES
-- ============================================================

create table public.tournament_matches (
  id uuid primary key default gen_random_uuid(),

  tournament_id uuid not null
    references public.tournaments(id)
    on delete cascade,

  match_id uuid not null
    references public.matches(id)
    on delete cascade,

  round_number integer not null default 1,

  bracket text
    check (
      bracket in (
        'main',
        'winners',
        'losers',
        'grand_final',
        'group'
      )
    ),

  position integer,

  next_winner_match_id uuid
    references public.tournament_matches(id)
    on delete set null,

  next_loser_match_id uuid
    references public.tournament_matches(id)
    on delete set null,

  created_at timestamptz not null default now(),

  unique(tournament_id, match_id)
);

-- ============================================================
-- REPORTS
-- ============================================================

create table public.reports (
  id uuid primary key default gen_random_uuid(),

  reporter_id uuid not null
    references public.profiles(id)
    on delete restrict,

  reported_profile_id uuid not null
    references public.profiles(id)
    on delete restrict,

  match_id uuid
    references public.matches(id)
    on delete set null,

  category text not null,

  description text,

  status text not null default 'pending'
    check (
      status in (
        'pending',
        'reviewing',
        'resolved',
        'dismissed'
      )
    ),

  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

-- ============================================================
-- PENALTIES
-- ============================================================

create table public.penalties (
  id uuid primary key default gen_random_uuid(),

  profile_id uuid not null
    references public.profiles(id)
    on delete restrict,

  issued_by uuid
    references public.profiles(id)
    on delete set null,

  type text not null
    check (
      type in (
        'warning',
        'mute',
        'match_ban',
        'temporary_ban',
        'permanent_ban'
      )
    ),

  reason text not null,

  starts_at timestamptz not null default now(),
  expires_at timestamptz,

  created_at timestamptz not null default now()
);

-- ============================================================
-- INDEXES
-- ============================================================

create index idx_player_identities_profile
  on public.player_identities(profile_id);

create index idx_player_identities_provider
  on public.player_identities(provider, provider_user_id);

create index idx_player_game_profiles_game
  on public.player_game_profiles(game_id);

create index idx_player_game_profiles_mmr
  on public.player_game_profiles(game_id, mmr desc);

create index idx_game_seasons_game
  on public.game_seasons(game_id);

create index idx_team_members_team
  on public.team_members(team_id);

create index idx_team_members_profile
  on public.team_members(profile_id);

create index idx_team_members_admin
  on public.team_members(team_id, is_admin)
  where is_admin = true;

create index idx_team_invitations_profile
  on public.team_invitations(invited_profile_id);

create index idx_team_invitations_team
  on public.team_invitations(team_id);

create index idx_matches_game_status
  on public.matches(game_id, status);

create index idx_match_players_profile
  on public.match_players(profile_id);

create index idx_tournaments_game_status
  on public.tournaments(game_id, status);

create index idx_tournament_teams_tournament
  on public.tournament_teams(tournament_id);

-- ============================================================
-- INITIAL GAMES
-- ============================================================

insert into public.games (
  slug,
  name,
  short_name,
  description,
  is_active
)
values (
  'cs2',
  'Counter-Strike 2',
  'CS2',
  'Competições de Counter-Strike 2 na RIO ESPORTS.',
  true
)
on conflict (slug) do nothing;

insert into public.games (
  slug,
  name,
  short_name,
  description,
  is_active
)
values
(
  'valorant',
  'VALORANT',
  'VAL',
  'Competições de VALORANT na RIO ESPORTS.',
  false
),
(
  'ea-fc',
  'EA Sports FC',
  'FC',
  'Competições de EA Sports FC.',
  false
),
(
  'street-fighter-6',
  'Street Fighter 6',
  'SF6',
  'Competições de fighting games.',
  false
)
on conflict (slug) do nothing;

-- ============================================================
-- UPDATED_AT FUNCTION
-- ============================================================

create or replace function public.set_updated_at()
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

-- ============================================================
-- PROFILE CREATION
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  generated_username text;
  generated_display_name text;
begin

  generated_username :=
    'player_' || substr(new.id::text, 1, 8);

  generated_display_name :=
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      generated_username
    );

  insert into public.profiles (
    id,
    username,
    display_name
  )
  values (
    new.id,
    generated_username,
    generated_display_name
  );

  insert into public.player_trust (
    profile_id
  )
  values (
    new.id
  );

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ============================================================
-- TEAM CREATOR
--
-- Quem cria uma equipe automaticamente vira:
--
-- PLAYER (Jogador)
-- ADMIN (Administrador)
--
-- Não é obrigado a ser OWNER.
-- ============================================================

create or replace function public.add_team_creator_as_admin()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin

  insert into public.team_members (
    team_id,
    profile_id,
    role,
    is_admin,
    status
  )
  values (
    new.id,
    new.created_by,
    'player',
    true,
    'active'
  );

  return new;
end;
$$;

create trigger on_team_created
  after insert on public.teams
  for each row
  execute function public.add_team_creator_as_admin();

-- ============================================================
-- PRIVATE RLS HELPER
--
-- Verifica se o usuário atual é administrador da equipe.
-- ============================================================

create or replace function private.is_team_admin(
  p_team_id uuid
)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1
    from public.team_members tm
    where tm.team_id = p_team_id
      and tm.profile_id = (select auth.uid())
      and tm.is_admin = true
      and tm.status = 'active'
  );
$$;

revoke all
on function private.is_team_admin(uuid)
from public, anon, authenticated;

grant usage on schema private to authenticated;

grant execute
on function private.is_team_admin(uuid)
to authenticated;

-- ============================================================
-- RLS
-- ============================================================

alter table public.profiles enable row level security;
alter table public.player_identities enable row level security;
alter table public.player_trust enable row level security;
alter table public.games enable row level security;
alter table public.game_seasons enable row level security;
alter table public.player_game_profiles enable row level security;
alter table public.rating_history enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.team_invitations enable row level security;
alter table public.matches enable row level security;
alter table public.match_players enable row level security;
alter table public.match_teams enable row level security;
alter table public.tournaments enable row level security;
alter table public.tournament_teams enable row level security;
alter table public.tournament_matches enable row level security;
alter table public.reports enable row level security;
alter table public.penalties enable row level security;

-- ============================================================
-- PROFILE POLICIES
-- ============================================================

create policy "Public profiles are viewable"
on public.profiles
for select
to anon, authenticated
using (is_active = true);

create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

-- ============================================================
-- GAME POLICIES
-- ============================================================

create policy "Games are publicly viewable"
on public.games
for select
to anon, authenticated
using (true);

create policy "Game seasons are publicly viewable"
on public.game_seasons
for select
to anon, authenticated
using (true);

-- ============================================================
-- PLAYER GAME PROFILE POLICIES
-- ============================================================

create policy "Player game profiles are publicly viewable"
on public.player_game_profiles
for select
to anon, authenticated
using (true);

create policy "Users can create own game profile"
on public.player_game_profiles
for insert
to authenticated
with check (
  profile_id = (select auth.uid())
);

create policy "Users can update own game profile"
on public.player_game_profiles
for update
to authenticated
using (
  profile_id = (select auth.uid())
)
with check (
  profile_id = (select auth.uid())
);

-- ============================================================
-- TEAM POLICIES
-- ============================================================

create policy "Teams are publicly viewable"
on public.teams
for select
to anon, authenticated
using (is_active = true);

create policy "Authenticated users can create teams"
on public.teams
for insert
to authenticated
with check (
  created_by = (select auth.uid())
);

create policy "Team admins can update teams"
on public.teams
for update
to authenticated
using (
  (select private.is_team_admin(id))
)
with check (
  (select private.is_team_admin(id))
);

create policy "Team admins can delete teams"
on public.teams
for delete
to authenticated
using (
  (select private.is_team_admin(id))
);

-- ============================================================
-- TEAM MEMBER POLICIES
-- ============================================================

create policy "Active team members are publicly viewable"
on public.team_members
for select
to anon, authenticated
using (
  status = 'active'
);

create policy "Team admins can add members"
on public.team_members
for insert
to authenticated
with check (
  (select private.is_team_admin(team_id))
);

create policy "Team admins can update members"
on public.team_members
for update
to authenticated
using (
  (select private.is_team_admin(team_id))
)
with check (
  (select private.is_team_admin(team_id))
);

create policy "Team admins can remove members"
on public.team_members
for delete
to authenticated
using (
  (select private.is_team_admin(team_id))
);

-- ============================================================
-- TEAM INVITATIONS
-- ============================================================

create policy "Users can view own invitations"
on public.team_invitations
for select
to authenticated
using (
  invited_profile_id = (select auth.uid())
  or invited_by = (select auth.uid())
);

create policy "Team admins can create invitations"
on public.team_invitations
for insert
to authenticated
with check (
  invited_by = (select auth.uid())
  and (select private.is_team_admin(team_id))
);

create policy "Invitation recipients can respond"
on public.team_invitations
for update
to authenticated
using (
  invited_profile_id = (select auth.uid())
)
with check (
  invited_profile_id = (select auth.uid())
);

create policy "Team admins can cancel invitations"
on public.team_invitations
for delete
to authenticated
using (
  (select private.is_team_admin(team_id))
);

-- ============================================================
-- MATCH POLICIES
-- ============================================================

create policy "Finished matches are publicly viewable"
on public.matches
for select
to anon, authenticated
using (
  status = 'finished'
);

create policy "Finished match players are publicly viewable"
on public.match_players
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.matches m
    where m.id = match_id
      and m.status = 'finished'
  )
);

create policy "Finished match teams are publicly viewable"
on public.match_teams
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.matches m
    where m.id = match_id
      and m.status = 'finished'
  )
);

-- ============================================================
-- TOURNAMENT POLICIES
-- ============================================================

create policy "Public tournaments are viewable"
on public.tournaments
for select
to anon, authenticated
using (
  status <> 'draft'
  or created_by = (select auth.uid())
);

create policy "Tournament teams are publicly viewable"
on public.tournament_teams
for select
to anon, authenticated
using (true);

create policy "Tournament matches are publicly viewable"
on public.tournament_matches
for select
to anon, authenticated
using (true);

-- ============================================================
-- REPORT POLICIES
-- ============================================================

create policy "Users can create reports"
on public.reports
for insert
to authenticated
with check (
  reporter_id = (select auth.uid())
);

create policy "Users can view own reports"
on public.reports
for select
to authenticated
using (
  reporter_id = (select auth.uid())
);

-- ============================================================
-- GRANTS
--
-- RLS continua sendo responsável pela autorização por linha.
-- ============================================================

grant select on public.profiles
to anon, authenticated;

grant update on public.profiles
to authenticated;

grant select on public.games
to anon, authenticated;

grant select on public.game_seasons
to anon, authenticated;

grant select, insert, update
on public.player_game_profiles
to authenticated;

grant select
on public.player_game_profiles
to anon;

grant select on public.teams
to anon, authenticated;

grant insert, update, delete
on public.teams
to authenticated;

grant select, insert, update, delete
on public.team_members
to authenticated;

grant select
on public.team_members
to anon;

grant select, insert, update, delete
on public.team_invitations
to authenticated;

grant select
on public.matches
to anon, authenticated;

grant select
on public.match_players
to anon, authenticated;

grant select
on public.match_teams
to anon, authenticated;

grant select
on public.tournaments
to anon, authenticated;

grant select
on public.tournament_teams
to anon, authenticated;

grant select
on public.tournament_matches
to anon, authenticated;

grant insert, select
on public.reports
to authenticated;

-- ============================================================
-- END OF MIGRATION 001
-- ============================================================