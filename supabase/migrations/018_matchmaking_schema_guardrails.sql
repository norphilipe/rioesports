-- ============================================================
-- RIO ESPORTS
-- Migration 018 - Matchmaking schema guardrails
-- ============================================================

create unique index if not exists idx_matchmaking_queue_one_active_per_player
on public.matchmaking_queue_entries(profile_id)
where status = 'queued';

create index if not exists idx_matchmaking_queue_active_lookup
on public.matchmaking_queue_entries(queue_mode_id, queued_at, rating_snapshot)
where status = 'queued';
