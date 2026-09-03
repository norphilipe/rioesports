-- RIO ESPORTS
-- Migration 015 - Harden matchmaking RPCs with RLS and SECURITY INVOKER

create policy "Players can join their own matchmaking queue"
on public.matchmaking_queue_entries
for insert
to authenticated
with check (profile_id = (select auth.uid()));

create policy "Players can update their own matchmaking queue entries"
on public.matchmaking_queue_entries
for update
to authenticated
using (profile_id = (select auth.uid()))
with check (profile_id = (select auth.uid()));

alter function public.join_matchmaking_queue(uuid, uuid) security invoker;
alter function public.leave_matchmaking_queue(uuid) security invoker;
