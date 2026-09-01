-- ============================================================
-- RIO ESPORTS
-- Migration 005 - Competitive matchmaking core
-- ============================================================

create type public.matchmaking_queue_status as enum (
  'queued', 'matched', 'cancelled', 'expired'
);

create table public.queue_modes (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  slug text not null,
  name text not null,
  team_size integer not null check (team_size > 0 and team_size <= 10),
  is_ranked boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique(game_id, slug)
);

create table public.matchmaking_queue_entries (
  id uuid primary key default gen_random_uuid(),
  queue_mode_id uuid not null references public.queue_modes(id) on delete restrict,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  player_game_profile_id uuid not null references public.player_game_profiles(id) on delete restrict,
  rating_snapshot integer not null,
  status public.matchmaking_queue_status not null default 'queued',
  queued_at timestamptz not null default now(),
  matched_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((status = 'queued' and matched_at is null and cancelled_at is null)
    or (status = 'matched' and matched_at is not null and cancelled_at is null)
    or (status in ('cancelled', 'expired') and cancelled_at is not null))
);

create unique index idx_matchmaking_queue_one_active_per_player_mode
  on public.matchmaking_queue_entries(profile_id, queue_mode_id)
  where status = 'queued';

create index idx_matchmaking_queue_active_lookup
  on public.matchmaking_queue_entries(queue_mode_id, queued_at, rating_snapshot)
  where status = 'queued';

alter table public.matches
  add column if not exists queue_mode_id uuid references public.queue_modes(id) on delete set null;
alter table public.matches
  add column if not exists matchmaking_formed_at timestamptz;

create or replace function private.validate_matchmaking_queue_entry()
returns trigger language plpgsql security invoker set search_path = '' as $$
declare v_game_id uuid; v_profile_id uuid; v_is_player boolean;
begin
  select game_id into v_game_id from public.queue_modes where id = new.queue_mode_id;
  select profile_id, is_player into v_profile_id, v_is_player from public.player_game_profiles where id = new.player_game_profile_id;
  if v_game_id is null or v_profile_id is null then raise exception 'invalid matchmaking references'; end if;
  if v_profile_id <> new.profile_id or not v_is_player then raise exception 'player game profile is not eligible for matchmaking'; end if;
  if not exists (select 1 from public.player_game_profiles where id = new.player_game_profile_id and game_id = v_game_id) then
    raise exception 'queue mode and player game profile belong to different games';
  end if;
  return new;
end;
$$;

create trigger matchmaking_queue_entries_validate
before insert or update of queue_mode_id, profile_id, player_game_profile_id
on public.matchmaking_queue_entries
for each row execute function private.validate_matchmaking_queue_entry();

alter table public.queue_modes enable row level security;
alter table public.matchmaking_queue_entries enable row level security;

create policy "Active queue modes are publicly readable" on public.queue_modes for select using (is_active = true);
create policy "Players can read their own queue entries" on public.matchmaking_queue_entries for select using (profile_id = auth.uid());
