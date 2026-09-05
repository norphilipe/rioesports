-- ============================================================
-- RIO ESPORTS
-- Migration 015 - FACEIT webhook processing state
-- ============================================================

alter table public.faceit_webhook_events
  add column if not exists event_kind text,
  add column if not exists entity_id text,
  add column if not exists processing_status text not null default 'pending',
  add column if not exists processing_attempts integer not null default 0;

create index if not exists faceit_webhook_events_processing_queue_idx
  on public.faceit_webhook_events (processing_status, received_at)
  where processed_at is null;

create index if not exists faceit_webhook_events_entity_idx
  on public.faceit_webhook_events (event_kind, entity_id);
