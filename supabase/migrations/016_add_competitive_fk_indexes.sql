-- Add indexes for high-traffic competitive foreign keys.

create index if not exists idx_match_teams_team_id on public.match_teams(team_id);
create index if not exists idx_matches_queue_mode_id on public.matches(queue_mode_id);
create index if not exists idx_matchmaking_queue_entries_player_game_profile_id on public.matchmaking_queue_entries(player_game_profile_id);
create index if not exists idx_rating_history_player_game_profile_id on public.rating_history(player_game_profile_id);
create index if not exists idx_rating_history_season_id on public.rating_history(season_id);
