-- ============================================================
-- RIO ESPORTS
-- Migration 024 - Trusted rating result persistence
-- ============================================================

create or replace function public.apply_competitive_rating_change(
  p_profile_id uuid,
  p_game_id uuid,
  p_match_id uuid,
  p_previous_mmr integer,
  p_new_mmr integer,
  p_reason text default 'match_result'
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_player_game_profile_id uuid;
begin
  if p_new_mmr < 0 then
    raise exception 'new mmr must not be negative';
  end if;

  update public.player_game_profiles
  set mmr = p_new_mmr,
      updated_at = now()
  where profile_id = p_profile_id
    and game_id = p_game_id
  returning id into v_player_game_profile_id;

  if not found then
    raise exception 'player game profile not found';
  end if;

  insert into public.rating_history (
    player_game_profile_id,
    match_id,
    previous_mmr,
    new_mmr,
    change,
    reason
  ) values (
    v_player_game_profile_id,
    p_match_id,
    p_previous_mmr,
    p_new_mmr,
    p_new_mmr - p_previous_mmr,
    p_reason
  );
end;
$$;

revoke all on function public.apply_competitive_rating_change(
  uuid, uuid, uuid, integer, integer, text
) from public, anon, authenticated;
