-- RIO ESPORTS
-- Migration 013 - Atomic competitive rating application

create or replace function public.apply_competitive_match_rating(p_match_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_match record;
  v_game_id uuid;
  v_delta integer := 25;
  v_player record;
  v_game_profile record;
  v_change integer;
  v_previous integer;
  v_next integer;
begin
  select id, game_id, status into v_match from public.matches where id = p_match_id for update;
  if not found then raise exception 'match not found'; end if;
  if v_match.status = 'finished' then return; end if;
  v_game_id := v_match.game_id;

  for v_player in
    select profile_id, won from public.match_players where match_id = p_match_id
  loop
    if v_player.won is null then continue; end if;

    select * into v_game_profile
    from public.player_game_profiles
    where profile_id = v_player.profile_id and game_id = v_game_id
    for update;

    if not found then
      insert into public.player_game_profiles(profile_id, game_id, is_player, mmr)
      values (v_player.profile_id, v_game_id, true, 1000)
      returning * into v_game_profile;
    end if;

    v_previous := v_game_profile.mmr;
    v_change := case when v_player.won then v_delta else -v_delta end;
    v_next := greatest(0, v_previous + v_change);

    update public.player_game_profiles
    set mmr = v_next,
        wins = wins + case when v_player.won then 1 else 0 end,
        losses = losses + case when v_player.won then 0 else 1 end,
        placement_matches = placement_matches + 1,
        updated_at = now()
    where id = v_game_profile.id;

    insert into public.rating_history(player_game_profile_id, match_id, previous_mmr, new_mmr, change, reason)
    values (v_game_profile.id, p_match_id, v_previous, v_next, v_change, 'external_match_confirmed');

    update public.match_players
    set mmr_before = v_previous, mmr_after = v_next
    where match_id = p_match_id and profile_id = v_player.profile_id;
  end loop;
end;
$$;
