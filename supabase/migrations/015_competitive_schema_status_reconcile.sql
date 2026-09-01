-- ============================================================
-- RIO ESPORTS
-- Migration 015 - Competitive schema status reconciliation
-- ============================================================

alter table public.competitive_identities
  drop constraint if exists competitive_identities_status_check;

alter table public.competitive_identities
  add constraint competitive_identities_status_check
  check (status in ('pending', 'verified', 'blocked', 'revoked'));
