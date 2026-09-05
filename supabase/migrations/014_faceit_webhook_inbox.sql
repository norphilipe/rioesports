-- ============================================================
-- RIO ESPORTS
-- Migration 014 - FACEIT webhook inbox
-- ============================================================

create table if not exists public.faceit_webhook_events (
  id uuid primary key default gen_random_uuid(),
  event_fingerprint text not null unique,
  event_type text,
  payload jsonb not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  processing_error text
);

create index if not exists faceit_webhook_events_received_at_idx
  on public.faceit_webhook_events (received_at desc);

create index if not exists faceit_webhook_events_unprocessed_idx
  on public.faceit_webhook_events (received_at)
  where processed_at is null;

alter table public.faceit_webhook_events enable row level security;
