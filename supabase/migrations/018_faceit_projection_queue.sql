create table if not exists public.faceit_projection_jobs (
  id uuid primary key default gen_random_uuid(),
  faceit_match_id text not null,
  job_type text not null default 'match_projection',
  status text not null default 'pending',
  attempts integer not null default 0,
  last_error text,
  created_at timestamptz not null default now(),
  processed_at timestamptz,
  unique(faceit_match_id, job_type)
);

create index if not exists faceit_projection_jobs_queue_idx
  on public.faceit_projection_jobs(status, created_at)
  where processed_at is null;

alter table public.faceit_projection_jobs enable row level security;
revoke all on public.faceit_projection_jobs from anon, authenticated;
