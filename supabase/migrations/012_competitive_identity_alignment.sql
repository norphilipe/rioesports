-- ============================================================
-- RIO ESPORTS
-- Migration 012 - Competitive identity alignment
-- ============================================================
-- Ensures the canonical identity status vocabulary used by the
-- application is accepted by production.

alter table public.competitive_identities
  drop constraint if exists competitive_identities_status_check;

alter table public.competitive_identities
  add constraint competitive_identities_status_check
  check (status in ('pending', 'verified', 'blocked', 'revoked'));
