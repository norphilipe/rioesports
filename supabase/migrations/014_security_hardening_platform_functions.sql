-- ============================================================
-- RIO ESPORTS
-- Migration 014 - Security hardening for platform functions
-- ============================================================

-- Platform admin checks must not be anonymously callable.
revoke all on function public.is_platform_admin() from public, anon, authenticated;
grant execute on function public.is_platform_admin() to authenticated;

-- Competitive restriction checks are consumed internally by trusted
-- SECURITY DEFINER functions and are not exposed as a public RPC.
revoke all on function public.is_user_competitively_restricted(uuid) from public, anon, authenticated;
