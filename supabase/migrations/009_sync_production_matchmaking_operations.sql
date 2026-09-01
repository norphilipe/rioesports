-- ============================================================
-- RIO ESPORTS
-- Migration 009 - Production matchmaking operations sync
-- ============================================================
-- Brings production in line with the queue-operation layer after
-- the additive production schema synchronization.

create schema if not exists private;

create or replace function public.join_matchmaking_queue(
  p_queue_mode_id uuid,
  p_player_game_profile_id uuid
)
returns public.matchmaking_queue_entries
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_entry public.matchmaking_queue_entries;
  v_mmr integer;
  v_game_id uuid;
  v_mode_game_id uuid;
begin
  if auth.uid() is null then
    raise exception 'authentication required';
  end if;

  select game_id, mmr into v_game_id, v_mmr
  from public.player_game_profiles
  where id = p_player_game_profile_id
    and profile_id = auth.uid()
    and is_player = true;

  if not found then
    raise exception 'player game profile is not eligible for matchmaking';
  end if;

  select game_id into v_mode_game_id
  from public.queue_modes
  where id = p_queue_mode_id and is_active = true;

  if not found or v_mode_game_id <> v_game_id then
    raise exception 'queue mode is not compatible with player game profile';
  end if;

  select * into v_entry
  from public.matchmaking_queue_entries
  where queue_mode_id = p_queue_mode_id
    and profile_id = auth.uid()
    and status = 'queued'
  for update;

  if found then
    return v_entry;
  end if;

  if exists (
    select 1
    from public.matchmaking_queue_entries
    where profile_id = auth.uid() and status = 'queued'
  ) then
    raise exception 'player already has an active matchmaking queue entry';
  end if;

  insert into public.matchmaking_queue_entries(
    queue_mode_id,
    profile_id,
    player_game_profile_id,
    rating_snapshot
  )
  values (
    p_queue_mode_id,
    auth.uid(),
    p_player_game_profile_id,
    v_mmr
  )
  returning * into v_entry;

  return v_entry;
end;
$$;

revoke all on function public.join_matchmaking_queue(uuid, uuid) from public;
grant execute on function public.join_matchmaking_queue(uuid, uuid) to authenticated;

create or replace function public.leave_matchmaking_queue(
  p_queue_entry_id uuid
)
returns public.matchmaking_queue_entries
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_entry public.matchmaking_queue_entries;
begin
  if auth.uid() is null then
    raise exception 'authentication required';
  end if;

  update public.matchmaking_queue_entries
  set status = 'cancelled', cancelled_at = now(), updated_at = now()
  where id = p_queue_entry_id
    and profile_id = auth.uid()
    and status = 'queued'
  returning * into v_entry;

  if not found then
    raise exception 'active matchmaking queue entry not found';
  end if;

  return v_entry;
end;
$$;

revoke all on function public.leave_matchmaking_queue(uuid) from public;
grant execute on function public.leave_matchmaking_queue(uuid) to authenticated;

create or replace function private.form_matchmaking_match(
  p_queue_mode_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_team_size integer;
  v_game_id uuid;
  v_match_id uuid;
  v_entry_ids uuid[];
  v_entry record;
  v_position integer := 0;
  v_required_players integer;
begin
  select team_size, game_id into v_team_size, v_game_id
  from public.queue_modes
  where id = p_queue_mode_id and is_active = true
  for update;

  if not found then
    raise exception 'active queue mode not found';
  end if;

  v_required_players := v_team_size * 2;

  select array_agg(id order by queued_at, id) into v_entry_ids
  from (
    select id
    from public.matchmaking_queue_entries
    where queue_mode_id = p_queue_mode_id and status = 'queued'
    order by queued_at, id
    limit v_required_players
    for update skip locked
  ) candidates;

  if coalesce(array_length(v_entry_ids, 1), 0) < v_required_players then
    return null;
  end if;

  insert into public.matches(
    game_id,
    match_type,
    status,
    queue_mode_id,
    matchmaking_formed_at
  )
  values (
    v_game_id,
    'matchmaking',
    'pending',
    p_queue_mode_id,
    now()
  )
  returning id into v_match_id;

  for v_entry in
    select *
    from public.matchmaking_queue_entries
    where id = any(v_entry_ids)
    order by queued_at, id
  loop
    v_position := v_position + 1;

    insert into public.match_players(
      match_id,
      profile_id,
      team_side,
      mmr_before
    )
    values (
      v_match_id,
      v_entry.profile_id,
      case when v_position <= v_team_size then 'team_a' else 'team_b' end,
      v_entry.rating_snapshot
    );

    update public.matchmaking_queue_entries
    set status = 'matched', matched_at = now(), updated_at = now()
    where id = v_entry.id and status = 'queued';
  end loop;

  return v_match_id;
end;
$$;

revoke all on function private.form_matchmaking_match(uuid) from public, anon, authenticated;
