-- ============================================================
-- RIO ESPORTS
-- Migration 020 - Match lifecycle foundation
-- ============================================================

alter table public.matches
  add column if not exists server_status text not null default 'unassigned'
    check (server_status in ('unassigned', 'provisioning', 'ready', 'failed', 'released'));

alter table public.matches
  add column if not exists server_endpoint text;

alter table public.matches
  add column if not exists ready_at timestamptz;

alter table public.matches
  add column if not exists started_at timestamptz;

alter table public.matches
  add column if not exists completed_at timestamptz;
