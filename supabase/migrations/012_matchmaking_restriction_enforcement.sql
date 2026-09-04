-- ============================================================
-- RIO ESPORTS
-- Migration 012 - Enforce competitive restrictions at database level
-- ============================================================

create or replace function public.join_matchmaking_queue(p_queue_mode_id uuid, p_player_game_profile_id uuid)
returns public.matchmaking_queue_entries
language plpgsql security definer set search_path = '' as $$
declare
  v_entry public.matchmaking_queue_entries;
  v_mmr integer;
  v_game_id uuid;
  v_mode_game_id uuid;
  v_restricted boolean;
begin
  if auth.uid() is null then
    raise exception 'authentication required';
  end if;

  select public.is_user_competitively_restricted(auth.uid()) into v_restricted;
  if coalesce(v_restricted, false) then
    raise exception 'competitive restriction active';
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
  where id = p_queue_mode_id
    and is_active = true;

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
    where profile_id = auth.uid()
      and status = 'queued'
  ) then
    raise exception 'player already has an active matchmaking queue entry';
  end if;

  insert into public.matchmaking_queue_entries(
    queue_mode_id,
    profile_id,
    player_game_profile_id,
    rating_snapshot
  ) values (
    p_queue_mode_id,
    auth.uid(),
    p_player_game_profile_id,
    v_mmr
  ) returning * into v_entry;

  return v_entry;
end;
$$;

revoke all on function public.join_matchmaking_queue(uuid, uuid) from public;
grant execute on function public.join_matchmaking_queue(uuid, uuid) to authenticated;
