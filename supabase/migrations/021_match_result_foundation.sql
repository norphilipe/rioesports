-- ============================================================
-- RIO ESPORTS
-- Migration 021 - Match result foundation
-- ============================================================

alter table public.matches
  add column if not exists winner_team_side text
    check (winner_team_side in ('team_a', 'team_b'));

alter table public.matches
  add column if not exists result_source text;

alter table public.matches
  add column if not exists result_recorded_at timestamptz;

create index if not exists idx_matches_completed_at
  on public.matches(completed_at)
  where completed_at is not null;
