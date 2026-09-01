-- ============================================================
-- RIO ESPORTS
-- Migration 017 - Matchmaking validation trigger
-- ============================================================

create or replace function private.validate_matchmaking_queue_entry()
returns trigger language plpgsql security invoker set search_path = '' as $$
declare v_game_id uuid; v_profile_id uuid; v_is_player boolean;
begin
  select game_id into v_game_id from public.queue_modes where id = new.queue_mode_id;
  select profile_id, is_player into v_profile_id, v_is_player from public.player_game_profiles where id = new.player_game_profile_id;
  if v_game_id is null or v_profile_id is null then raise exception 'invalid matchmaking references'; end if;
  if v_profile_id <> new.profile_id or not v_is_player then raise exception 'player game profile is not eligible for matchmaking'; end if;
  if not exists (select 1 from public.player_game_profiles where id = new.player_game_profile_id and game_id = v_game_id) then raise exception 'queue mode and player game profile belong to different games'; end if;
  return new;
end;
$$;

drop trigger if exists matchmaking_queue_entries_validate on public.matchmaking_queue_entries;
create trigger matchmaking_queue_entries_validate
before insert or update of queue_mode_id, profile_id, player_game_profile_id
on public.matchmaking_queue_entries
for each row execute function private.validate_matchmaking_queue_entry();
