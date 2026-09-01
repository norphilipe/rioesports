-- ============================================================
-- RIO ESPORTS
-- Migration 013 - Production matchmaking safety
-- ============================================================

-- Keep a player in at most one active queue globally.
create unique index if not exists idx_matchmaking_queue_one_active_per_player
  on public.matchmaking_queue_entries(profile_id)
  where status = 'queued';

-- Expired queue entries must carry a terminal timestamp.
alter table public.matchmaking_queue_entries
  drop constraint if exists matchmaking_queue_entries_status_check;

alter table public.matchmaking_queue_entries
  add constraint matchmaking_queue_entries_status_check
  check (
    (status = 'queued' and matched_at is null and cancelled_at is null)
    or (status = 'matched' and matched_at is not null and cancelled_at is null)
    or (status in ('cancelled', 'expired') and cancelled_at is not null)
  );
