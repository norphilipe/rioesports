-- RIO ESPORTS
-- Migration 012 - Competitive profiles

create table if not exists public.competitive_profiles (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  nickname text,
  rating integer not null default 1000 check (rating >= 0),
  matches_played integer not null default 0 check (matches_played >= 0),
  wins integer not null default 0 check (wins >= 0 and wins <= matches_played),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists competitive_profiles_ranking_idx
  on public.competitive_profiles(rating desc, wins desc);

alter table public.competitive_profiles enable row level security;

create policy "Competitive profiles are publicly readable"
  on public.competitive_profiles for select using (true);

create policy "Users can insert their own competitive profile"
  on public.competitive_profiles for insert with check (profile_id = auth.uid());

create policy "Users can update their own competitive profile"
  on public.competitive_profiles for update using (profile_id = auth.uid()) with check (profile_id = auth.uid());
