-- ============================================================
-- RIO ESPORTS
-- Migration 004 - Team and invitation security
-- ============================================================
-- Incremental hardening for team administration and invitation flows.
-- Historical migrations remain immutable.

-- ----------------------------------------------------------------
-- Team membership integrity
-- ----------------------------------------------------------------
-- A player can belong to multiple teams, but a team must not contain
-- more than one active membership for the same profile.
create unique index if not exists idx_team_members_one_active_membership
  on public.team_members(team_id, profile_id)
  where status = 'active';

-- Prevent impossible membership timestamps.
alter table public.team_members
  drop constraint if exists team_members_valid_membership_dates;
alter table public.team_members
  add constraint team_members_valid_membership_dates
  check (left_at is null or left_at >= joined_at);

-- ----------------------------------------------------------------
-- Team administration helper
-- ----------------------------------------------------------------
create or replace function private.is_team_member(
  p_team_id uuid,
  p_profile_id uuid
)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1
    from public.team_members tm
    where tm.team_id = p_team_id
      and tm.profile_id = p_profile_id
      and tm.status = 'active'
  );
$$;

revoke all on function private.is_team_member(uuid, uuid) from public, anon, authenticated;

-- ----------------------------------------------------------------
-- Invitation lifecycle integrity
-- ----------------------------------------------------------------
-- Only one pending invitation may exist for the same player and team.
create unique index if not exists idx_team_invitations_one_pending
  on public.team_invitations(team_id, invited_profile_id)
  where status = 'pending';

-- Recipients can only transition a pending invitation to accepted or
-- declined. Identity fields remain protected by migration 002.
create or replace function private.validate_invitation_response()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status is distinct from old.status then
    if old.status <> 'pending'
      or new.status not in ('accepted', 'declined') then
      raise exception 'invalid invitation status transition';
    end if;

    if new.responded_at is null then
      new.responded_at = now();
    end if;
  elsif new.responded_at is distinct from old.responded_at then
    raise exception 'invitation response timestamp is server managed';
  end if;

  return new;
end;
$$;

revoke all on function private.validate_invitation_response() from public, anon, authenticated;

drop trigger if exists team_invitations_validate_response on public.team_invitations;
create trigger team_invitations_validate_response
before update on public.team_invitations
for each row
execute function private.validate_invitation_response();

-- ----------------------------------------------------------------
-- Controlled invitation acceptance
-- ----------------------------------------------------------------
-- Accepting an invitation is a server-owned transactional operation.
-- The function is intentionally not exposed to client roles; a future
-- trusted server action may call it with elevated credentials.
create or replace function private.accept_team_invitation(
  p_invitation_id uuid,
  p_profile_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_invitation public.team_invitations%rowtype;
begin
  select *
  into v_invitation
  from public.team_invitations
  where id = p_invitation_id
    and invited_profile_id = p_profile_id
    and status = 'pending'
  for update;

  if not found then
    raise exception 'pending invitation not found';
  end if;

  insert into public.team_members (
    team_id,
    profile_id,
    role,
    is_admin,
    status
  )
  values (
    v_invitation.team_id,
    v_invitation.invited_profile_id,
    v_invitation.role,
    false,
    'active'
  )
  on conflict (team_id, profile_id) do update
  set role = excluded.role,
      status = 'active',
      left_at = null;

  update public.team_invitations
  set status = 'accepted',
      responded_at = now()
  where id = v_invitation.id;
end;
$$;

revoke all on function private.accept_team_invitation(uuid, uuid) from public, anon, authenticated;

-- ----------------------------------------------------------------
-- RLS policy tightening
-- ----------------------------------------------------------------
-- Direct client creation of memberships bypasses the invitation flow.
-- Remove the permissive policy so future membership changes happen
-- through controlled server operations.
drop policy if exists "Team admins can add members" on public.team_members;

-- Team administrators must not freely rewrite another member's identity
-- or privilege level through a generic UPDATE. Remove the broad client
-- update policy until dedicated server-side operations are introduced.
drop policy if exists "Team admins can update members" on public.team_members;

-- The invitation recipient can no longer mutate arbitrary response
-- timestamps or perform repeated status transitions; the trigger above
-- validates the only permitted transition.
