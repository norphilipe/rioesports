-- ============================================================
-- RIO ESPORTS
-- Migration 024 - Competitive match processing idempotency guard
-- ============================================================

create table if not exists public.competitive_match_processing (
  match_id uuid primary key references public.matches(id) on delete cascade,
  processed_at timestamptz not null default now(),
  result_source text not null
);

alter table public.competitive_match_processing enable row level security;

revoke all on table public.competitive_match_processing from anon, authenticated;

grant select, insert, update, delete on table public.competitive_match_processing to service_role;

create or replace function public.claim_competitive_match_processing(
  p_match_id uuid,
  p_result_source text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.competitive_match_processing (match_id, result_source)
  values (p_match_id, p_result_source)
  on conflict (match_id) do nothing;

  return found;
end;
$$;

revoke all on function public.claim_competitive_match_processing(uuid, text)
from public, anon, authenticated;
