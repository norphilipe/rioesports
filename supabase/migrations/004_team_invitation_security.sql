-- ============================================================
-- RIO ESPORTS
-- Migration 004 - Team and invitation security
-- ============================================================
-- Incremental hardening for team administration and invitation flows.
-- Historical migrations remain immutable.

-- ----------------------------------------------------------------
-- Team membership integrity
-- ----------------------------------------------------------------
-- The historical schema already guarantees one row per team/profile.
-- This constraint adds temporal consistency for memberships.
alter table public.team_members
  drop constraint if exists team_members_valid_membership_dates;
alter table public.team_members
  add constraint team_members_valid_membership_dates
  check (left_at is null or left_at >= joined_at);

-- ----------------------------------------------------------------
-- Invitation lifecycle integrity
-- ----------------------------------------------------------------
-- Only one pending invitation may exist for the same player and team.
create unique index if not exists idx_team_invitations_one_pending
  on public.team_invitations(team_id, invited_profile_id)
  where status = 'pending';

-- Recipients may only transition pending invitations to accepted or
-- declined. Cancellation is an administrative operation and therefore
-- cannot be performed through the recipient response policy.
create or replace function private.validate_invitation_response()
returns trigger
language plpgsql
security invoker
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
-- Accepting an invitation and creating membership must happen inside
-- one transaction. The function is intentionally not exposed to API
-- client roles; a future trusted server operation may invoke it.
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

  -- One row per team/profile is enforced by the historical schema.
  -- An existing departed membership can be reactivated safely.
  insert into public.team_members (
    team_id,
    profile_id,
    role,
    is_admin,
    status,
    joined_at,
    left_at
  )
  values (
    v_invitation.team_id,
    v_invitation.invited_profile_id,
    v_invitation.role,
    false,
    'active',
    now(),
    null
  )
  on conflict (team_id, profile_id) do update
  set role = excluded.role,
      status = 'active',
      joined_at = excluded.joined_at,
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
-- Remove the permissive policy so membership changes happen through
-- dedicated server-owned operations.
drop policy if exists "Team admins can add members" on public.team_members;

-- Administrators must not freely rewrite another member's identity,
-- role or privilege level through a generic UPDATE.
drop policy if exists "Team admins can update members" on public.team_members;
