-- ============================================================
-- RIO ESPORTS
-- Migration 014 - Finalize canonical admin moderation access
-- ============================================================

create index if not exists platform_moderation_actions_expires_at_idx
  on public.platform_moderation_actions(expires_at);

create index if not exists platform_moderation_actions_created_at_idx
  on public.platform_moderation_actions(created_at desc);

drop policy if exists "platform admins can manage moderation actions" on public.platform_moderation_actions;
create policy "platform admins can manage moderation actions"
on public.platform_moderation_actions
for all
to authenticated
using ((select public.is_current_platform_admin()))
with check (
  (select public.is_current_platform_admin())
  and moderator_profile_id = (select auth.uid())
);
