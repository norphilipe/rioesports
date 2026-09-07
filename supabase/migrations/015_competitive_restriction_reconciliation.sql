-- RIO ESPORTS - reconcile competitive restriction enforcement
create or replace function public.is_user_competitively_restricted(p_profile_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.platform_moderation_actions action
    where action.target_profile_id = p_profile_id
      and action.action_type = 'competitive_restriction'
      and (action.expires_at is null or action.expires_at > now())
  );
$$;
revoke all on function public.is_user_competitively_restricted(uuid) from public;
grant execute on function public.is_user_competitively_restricted(uuid) to authenticated;
create index if not exists platform_moderation_active_competitive_idx
  on public.platform_moderation_actions(target_profile_id, expires_at)
  where action_type = 'competitive_restriction';
