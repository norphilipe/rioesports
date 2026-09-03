-- Restrict exposed SECURITY DEFINER functions.
-- MMR application is server-only; queue operations require authentication.

revoke all on function public.apply_competitive_match_rating(uuid) from public;
revoke execute on function public.apply_competitive_match_rating(uuid) from anon;
revoke execute on function public.apply_competitive_match_rating(uuid) from authenticated;

revoke all on function public.join_matchmaking_queue(uuid, uuid) from public;
revoke execute on function public.join_matchmaking_queue(uuid, uuid) from anon;
grant execute on function public.join_matchmaking_queue(uuid, uuid) to authenticated;

revoke all on function public.leave_matchmaking_queue(uuid) from public;
revoke execute on function public.leave_matchmaking_queue(uuid) from anon;
grant execute on function public.leave_matchmaking_queue(uuid) to authenticated;
