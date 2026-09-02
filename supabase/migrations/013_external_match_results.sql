-- ============================================================
-- RIO ESPORTS
-- Migration 013 - External match results
-- ============================================================

create type public.external_match_verification_method as enum (
  'demo',
  'captain_confirmation'
);

create type public.external_match_result_status as enum (
  'pending',
  'verified',
  'rejected',
  'applied'
);

create table public.external_match_results (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null unique references public.matches(id) on delete cascade,
  winner_team_id text not null,
  loser_team_id text not null,
  winner_score integer not null check (winner_score >= 0),
  loser_score integer not null check (loser_score >= 0),
  verification_method public.external_match_verification_method not null,
  status public.external_match_result_status not null default 'pending',
  evidence jsonb not null default '{}'::jsonb,
  verified_at timestamptz,
  applied_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (winner_team_id <> loser_team_id),
  check ((status in ('verified', 'applied') and verified_at is not null) or status in ('pending', 'rejected')),
  check ((status = 'applied' and applied_at is not null) or status <> 'applied')
);

create table public.external_match_result_confirmations (
  id uuid primary key default gen_random_uuid(),
  result_id uuid not null references public.external_match_results(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  team_id text not null,
  confirmed_at timestamptz not null default now(),
  unique(result_id, profile_id),
  unique(result_id, team_id)
);

create index external_match_results_status_idx
  on public.external_match_results(status)
  where status in ('pending', 'verified');

alter table public.external_match_results enable row level security;
alter table public.external_match_result_confirmations enable row level security;

create policy "Verified external results are readable" on public.external_match_results
  for select using (status in ('verified', 'applied'));

create policy "Players can read their own result confirmations" on public.external_match_result_confirmations
  for select using (profile_id = auth.uid());
