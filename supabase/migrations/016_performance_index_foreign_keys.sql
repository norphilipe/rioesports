-- ============================================================
-- RIO ESPORTS
-- Migration 016 - Performance indexes for foreign keys
-- ============================================================

create index if not exists news_articles_author_id_idx on public.news_articles(author_id);
create index if not exists news_posts_author_id_idx on public.news_posts(author_id);
create index if not exists penalties_issued_by_idx on public.penalties(issued_by);
create index if not exists penalties_profile_id_idx on public.penalties(profile_id);
create index if not exists reports_match_id_idx on public.reports(match_id);
create index if not exists reports_reported_profile_id_idx on public.reports(reported_profile_id);
create index if not exists reports_reporter_id_idx on public.reports(reporter_id);
create index if not exists team_invitations_invited_by_idx on public.team_invitations(invited_by);
create index if not exists teams_created_by_idx on public.teams(created_by);
create index if not exists teams_owner_id_idx on public.teams(owner_id);
create index if not exists tournament_matches_next_loser_match_id_idx on public.tournament_matches(next_loser_match_id);
create index if not exists tournament_matches_next_winner_match_id_idx on public.tournament_matches(next_winner_match_id);
create index if not exists tournaments_created_by_idx on public.tournaments(created_by);
create index if not exists user_penalties_moderator_id_idx on public.user_penalties(moderator_id);
create index if not exists user_penalties_revoked_by_idx on public.user_penalties(revoked_by);
