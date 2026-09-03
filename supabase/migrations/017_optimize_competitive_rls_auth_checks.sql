-- Avoid per-row re-evaluation of auth.uid() in RLS policies.

alter policy "Players can read their own queue entries"
on public.matchmaking_queue_entries
using (profile_id = (select auth.uid()));

alter policy "Users can read their competitive identities"
on public.competitive_identities
using (user_id = (select auth.uid()));

alter policy "Users can read their competitive state"
on public.player_competitive_state
using (user_id = (select auth.uid()));
