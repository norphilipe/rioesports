create table if not exists public.faceit_match_projections (
  faceit_match_id text primary key,
  status text,
  finished_at timestamptz,
  winner_team_id text,
  teams jsonb not null default '[]'::jsonb,
  source_updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists faceit_match_projections_finished_idx
  on public.faceit_match_projections (finished_at desc);

alter table public.faceit_match_projections enable row level security;
revoke all on public.faceit_match_projections from anon, authenticated;
