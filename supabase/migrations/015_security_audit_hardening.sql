-- ============================================================
-- RIO ESPORTS
-- Migration 015 - Security audit hardening
-- ============================================================

-- Moderation actions are internal records. Keep RLS enabled and expose
-- explicit access only to active platform administrators.
create policy "platform admins can read moderation actions"
on public.platform_moderation_actions
for select
using (public.is_platform_admin());

-- The public matchmaking RPC is intentionally callable by authenticated
-- players and performs its own ownership and restriction checks.

-- Internal helper functions should not be callable through the public RPC API.
revoke all on function public.is_user_competitively_restricted(uuid) from public, anon, authenticated;

-- The identity-linking RPCs are intentionally authenticated-user callable and
-- enforce auth.uid() ownership inside the function bodies.
