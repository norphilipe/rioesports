-- Team invitation security
-- Applied after authentication and platform hardening migrations.

begin;

alter table if exists public.team_invitations enable row level security;

-- Invitations are visible only to their recipient or active members of the inviting team.
drop policy if exists "team_invitations_select_relevant" on public.team_invitations;
create policy "team_invitations_select_relevant" on public.team_invitations
  for select to authenticated
  using (
    invited_profile_id = auth.uid()
    or public.current_user_is_team_member(team_id)
  );

-- Only existing active team members may create invitations.
drop policy if exists "team_invitations_insert_members" on public.team_invitations;
create policy "team_invitations_insert_members" on public.team_invitations
  for insert to authenticated
  with check (public.current_user_is_team_member(team_id));

-- Recipients may update only their own invitation state.
drop policy if exists "team_invitations_update_recipient" on public.team_invitations;
create policy "team_invitations_update_recipient" on public.team_invitations
  for update to authenticated
  using (invited_profile_id = auth.uid())
  with check (invited_profile_id = auth.uid());

commit;
