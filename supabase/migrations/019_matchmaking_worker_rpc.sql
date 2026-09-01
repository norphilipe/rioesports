-- ============================================================
-- RIO ESPORTS
-- Migration 019 - Matchmaking worker RPC
-- ============================================================
-- This RPC is intentionally not granted to client roles.

create or replace function public.form_matchmaking_match(p_queue_mode_id uuid)
returns uuid
language sql
security definer
set search_path = ''
as $$
  select private.form_matchmaking_match(p_queue_mode_id);
$$;

revoke all on function public.form_matchmaking_match(uuid) from public, anon, authenticated;
