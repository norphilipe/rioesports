-- RIO ESPORTS
-- Migration 015 - Secure private competitive tables

create policy "Users can view own penalties"
on public.penalties
for select
to authenticated
using (profile_id = auth.uid());

create policy "Users can view own identities"
on public.player_identities
for select
to authenticated
using (profile_id = auth.uid());

create policy "Users can view own trust"
on public.player_trust
for select
to authenticated
using (profile_id = auth.uid());

create policy "Users can view own rating history"
on public.rating_history
for select
to authenticated
using (
  exists (
    select 1
    from public.player_game_profiles pgp
    where pgp.id = rating_history.player_game_profile_id
      and pgp.profile_id = auth.uid()
  )
);

revoke insert, update, delete on public.penalties from anon, authenticated;
revoke insert, update, delete on public.player_identities from anon, authenticated;
revoke insert, update, delete on public.player_trust from anon, authenticated;
revoke insert, update, delete on public.rating_history from anon, authenticated;
