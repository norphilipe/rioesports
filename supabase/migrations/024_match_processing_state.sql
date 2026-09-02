-- ============================================================
-- RIO ESPORTS
-- Migration 024 - Match processing state
-- ============================================================

alter table public.matches
  add column if not exists processing_state text not null default 'pending'
    check (processing_state in ('pending', 'processing', 'completed', 'failed'));

alter table public.matches
  add column if not exists processing_claimed_at timestamptz;

alter table public.matches
  add column if not exists processing_error text;

create index if not exists idx_matches_processing_state
  on public.matches(processing_state)
  where processing_state in ('pending', 'failed');

create or replace function public.claim_competitive_match_processing(
  p_match_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.matches
  set processing_state = 'processing',
      processing_claimed_at = now(),
      processing_error = null
  where id = p_match_id
    and processing_state in ('pending', 'failed')
    and status = 'completed';

  return found;
end;
$$;

revoke all on function public.claim_competitive_match_processing(uuid)
from public, anon, authenticated;
