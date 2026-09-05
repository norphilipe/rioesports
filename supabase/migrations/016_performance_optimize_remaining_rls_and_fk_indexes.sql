-- ============================================================
-- RIO ESPORTS
-- Migration 016 - Final RLS and foreign-key performance pass
-- ============================================================

create index if not exists tournament_matches_match_id_idx
  on public.tournament_matches(match_id);

create index if not exists tournament_teams_team_id_idx
  on public.tournament_teams(team_id);

alter policy "Users can view own penalties" on public.penalties
using (profile_id = (select auth.uid()));

alter policy "Users can view own identities" on public.player_identities
using (profile_id = (select auth.uid()));

alter policy "Users can view own trust" on public.player_trust
using (profile_id = (select auth.uid()));

alter policy "Users can view own rating history" on public.rating_history
using (
  exists (
    select 1
    from public.player_game_profiles pgp
    where pgp.id = rating_history.player_game_profile_id
      and pgp.profile_id = (select auth.uid())
  )
);

alter policy "Platform admins can create news" on public.news_posts
with check ((author_id = (select auth.uid())) and (select public.is_platform_admin()));

alter policy "Admins can create penalties" on public.user_penalties
with check ((moderator_id = (select auth.uid())) and (select public.is_platform_admin()));

alter policy "Users can view own penalties" on public.user_penalties
using (user_id = (select auth.uid()));
