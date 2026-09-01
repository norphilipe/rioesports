-- ============================================================
-- RIO ESPORTS
-- Migration 014 - Production competitive schema reconciliation
-- ============================================================
-- Consolidates the additive production changes applied during the
-- migration-drift recovery into a canonical repository migration.

create table if not exists public.competitive_identities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  provider text not null check (provider in ('steam','faceit','leetify')),
  external_id text not null,
  external_username text,
  status text not null default 'pending' check (status in ('pending','verified','blocked','revoked')),
  data_available boolean not null default false,
  verified_at timestamptz,
  last_verified_at timestamptz,
  last_sync_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, provider),
  unique(provider, external_id)
);

create table if not exists public.player_competitive_state (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  rsi numeric not null default 100,
  confidence_score numeric not null default 0,
  confidence_level text not null default 'low' check (confidence_level in ('low','medium','high')),
  faceit_ban_detected boolean not null default false,
  competitive_lock_reason text,
  calculated_at timestamptz not null default now()
);

alter table public.competitive_identities enable row level security;
alter table public.player_competitive_state enable row level security;

drop policy if exists "Users can read their competitive identities" on public.competitive_identities;
create policy "Users can read their competitive identities"
  on public.competitive_identities for select using (user_id = auth.uid());

drop policy if exists "Users can read their competitive state" on public.player_competitive_state;
create policy "Users can read their competitive state"
  on public.player_competitive_state for select using (user_id = auth.uid());
