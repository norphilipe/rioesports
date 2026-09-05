create table if not exists public.faceit_resources (
  id uuid primary key default gen_random_uuid(),
  resource_type text not null,
  faceit_id text not null,
  payload jsonb not null,
  source_event text,
  last_synced_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(resource_type, faceit_id)
);

create index if not exists faceit_resources_type_synced_idx
  on public.faceit_resources(resource_type, last_synced_at desc);

alter table public.faceit_resources enable row level security;

revoke all on public.faceit_resources from anon, authenticated;
