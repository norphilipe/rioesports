-- RIO ESPORTS - controlled platform moderation operations
create or replace function public.create_platform_moderation_action(p_target_profile_id uuid, p_action_type text, p_reason text default null, p_expires_at timestamptz default null)
returns public.platform_moderation_actions
language plpgsql security definer set search_path = public as $$
declare v_action public.platform_moderation_actions;
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
  if not public.is_current_platform_admin() then raise exception 'administrator access required'; end if;
  if p_target_profile_id is null then raise exception 'target profile is required'; end if;
  if p_target_profile_id = auth.uid() then raise exception 'administrators cannot moderate themselves through this operation'; end if;
  if p_action_type not in ('warning', 'temporary_restriction', 'competitive_restriction') then raise exception 'unsupported moderation action'; end if;
  if p_action_type in ('temporary_restriction', 'competitive_restriction') and p_expires_at is not null and p_expires_at <= now() then raise exception 'expiration must be in the future'; end if;
  insert into public.platform_moderation_actions(target_profile_id, moderator_profile_id, action_type, reason, expires_at)
  values (p_target_profile_id, auth.uid(), p_action_type, nullif(trim(coalesce(p_reason, '')), ''), p_expires_at)
  returning * into v_action;
  return v_action;
end;
$$;
revoke all on function public.create_platform_moderation_action(uuid, text, text, timestamptz) from public;
grant execute on function public.create_platform_moderation_action(uuid, text, text, timestamptz) to authenticated;
