-- RIO ESPORTS
-- Migration 011 - External match result verification

create table if not exists public.external_match_result_submissions (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  submitted_by uuid not null references public.profiles(id) on delete cascade,
  winner_team_id uuid not null references public.match_teams(id) on delete restrict,
  loser_team_id uuid not null references public.match_teams(id) on delete restrict,
  winner_score integer not null check (winner_score >= 0),
  loser_score integer not null check (loser_score >= 0),
  submitted_at timestamptz not null default now(),
  unique(match_id, submitted_by),
  check (winner_team_id <> loser_team_id),
  check (winner_score <> loser_score)
);

create index if not exists external_match_result_submissions_match_idx
  on public.external_match_result_submissions(match_id, submitted_at);

alter table public.external_match_result_submissions enable row level security;

create policy "Match participants can submit external results"
  on public.external_match_result_submissions
  for insert
  with check (
    submitted_by = auth.uid()
    and exists (
      select 1 from public.match_players mp
      where mp.match_id = external_match_result_submissions.match_id
        and mp.profile_id = auth.uid()
    )
    and exists (
      select 1 from public.match_teams mt
      where mt.id = external_match_result_submissions.winner_team_id
        and mt.match_id = external_match_result_submissions.match_id
    )
    and exists (
      select 1 from public.match_teams mt
      where mt.id = external_match_result_submissions.loser_team_id
        and mt.match_id = external_match_result_submissions.match_id
    )
  );

create policy "Match participants can read external results"
  on public.external_match_result_submissions
  for select
  using (
    exists (
      select 1 from public.match_players mp
      where mp.match_id = external_match_result_submissions.match_id
        and mp.profile_id = auth.uid()
    )
  );
