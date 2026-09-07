-- ============================================================
-- RIO ESPORTS
-- Migration 014 - Administrative moderation operations
-- ============================================================
-- Align the staff interface with the canonical moderation schema and
-- allow platform administrators to operate moderation records directly.

create index if not exists platform_moderation_actions_created_at_idx
  on public.platform_moderation_actions(created_at desc);

create index if not exists platform_moderation_actions_expires_at_idx
  on public.platform_moderation_actions(expires_at)
  where expires_at is not null;

drop policy if exists "Platform admins can view moderation actions"
  on public.platform_moderation_actions;
drop policy if exists "Platform admins can create moderation actions"
  on public.platform_moderation_actions;
drop policy if exists "Platform admins can update moderation actions"
  on public.platform_moderation_actions;
drop policy if exists "Platform admins can delete moderation actions"
  on public.platform_moderation_actions;

create policy "Platform admins can view moderation actions"
on public.platform_moderation_actions
for select
to authenticated
using ((select private.is_platform_admin((select auth.uid()))));

create policy "Platform admins can create moderation actions"
on public.platform_moderation_actions
for insert
to authenticated
with check (
  moderator_profile_id = (select auth.uid())
  and (select private.is_platform_admin((select auth.uid())))
);

create policy "Platform admins can update moderation actions"
on public.platform_moderation_actions
for update
to authenticated
using ((select private.is_platform_admin((select auth.uid()))))
with check ((select private.is_platform_admin((select auth.uid()))));

create policy "Platform admins can delete moderation actions"
on public.platform_moderation_actions
for delete
to authenticated
using ((select private.is_platform_admin((select auth.uid()))));
