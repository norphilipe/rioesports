-- RIO ESPORTS Competitive Identity System
-- Steam is the mandatory competitive identity. FACEIT and Leetify are optional
-- verified providers that increase the confidence of the player's RSI.

create type public.competitive_identity_provider as enum ('steam', 'faceit', 'leetify');
create type public.competitive_identity_status as enum ('pending', 'verified', 'blocked', 'revoked');
create type public.rsi_confidence_level as enum ('low', 'medium', 'high');

create table public.competitive_identities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete restrict,
  provider public.competitive_identity_provider not null,
  external_id text not null,
  external_username text,
  status public.competitive_identity_status not null default 'pending',
  data_available boolean not null default false,
  linked_at timestamptz not null default now(),
  verified_at timestamptz,
  last_verified_at timestamptz,
  last_sync_at timestamptz,
  revoked_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint competitive_identities_external_identity_unique unique (provider, external_id),
  constraint competitive_identities_user_provider_unique unique (user_id, provider),
  constraint competitive_identities_verified_timestamp check (
    status <> 'verified' or verified_at is not null
  )
);

create index competitive_identities_user_idx
  on public.competitive_identities(user_id);

create index competitive_identities_provider_status_idx
  on public.competitive_identities(provider, status);

create table public.player_competitive_state (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  rsi integer not null default 1000 check (rsi >= 0 and rsi <= 5000),
  confidence_score integer not null default 0 check (confidence_score >= 0 and confidence_score <= 100),
  confidence_level public.rsi_confidence_level not null default 'low',
  faceit_ban_detected boolean not null default false,
  competitive_lock_reason text,
  calculated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- The confidence model intentionally depends on verified and usable sources,
-- not merely on a player claiming to own an account.
create or replace function public.calculate_rsi_confidence(target_user_id uuid)
returns table(score integer, level public.rsi_confidence_level)
language sql
stable
set search_path = public
as $$
  with identities as (
    select provider, status, data_available
    from public.competitive_identities
    where user_id = target_user_id
  ),
  source_state as (
    select
      exists (
        select 1 from identities
        where provider = 'steam' and status = 'verified'
      ) as steam_verified,
      exists (
        select 1 from identities
        where provider = 'faceit' and status = 'verified' and data_available
      ) as faceit_usable,
      exists (
        select 1 from identities
        where provider = 'leetify' and status = 'verified' and data_available
      ) as leetify_usable
  )
  select
    case
      when steam_verified and faceit_usable and leetify_usable then 100
      when steam_verified and faceit_usable then 65
      when steam_verified then 30
      else 0
    end,
    case
      when steam_verified and faceit_usable and leetify_usable then 'high'::public.rsi_confidence_level
      when steam_verified and faceit_usable then 'medium'::public.rsi_confidence_level
      else 'low'::public.rsi_confidence_level
    end
  from source_state;
$$;

create or replace function public.refresh_player_rsi_confidence(target_user_id uuid)
returns public.player_competitive_state
language plpgsql
security definer
set search_path = public
as $$
declare
  next_score integer;
  next_level public.rsi_confidence_level;
  next_state public.player_competitive_state;
begin
  select score, level
  into next_score, next_level
  from public.calculate_rsi_confidence(target_user_id);

  insert into public.player_competitive_state (
    user_id,
    confidence_score,
    confidence_level,
    calculated_at,
    updated_at
  )
  values (
    target_user_id,
    coalesce(next_score, 0),
    coalesce(next_level, 'low'::public.rsi_confidence_level),
    now(),
    now()
  )
  on conflict (user_id) do update
  set confidence_score = excluded.confidence_score,
      confidence_level = excluded.confidence_level,
      calculated_at = excluded.calculated_at,
      updated_at = now()
  returning * into next_state;

  return next_state;
end;
$$;

create or replace function public.enforce_competitive_identity_rules()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' and old.provider = 'steam' then
    if new.user_id is distinct from old.user_id
      or new.external_id is distinct from old.external_id
      or new.provider is distinct from old.provider then
      raise exception 'Steam competitive identity is permanent and cannot be reassigned';
    end if;
  end if;

  new.updated_at = now();
  return new;
end;
$$;

create trigger competitive_identities_enforce_rules
before update on public.competitive_identities
for each row execute function public.enforce_competitive_identity_rules();

create or replace function public.prevent_steam_identity_deletion()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if old.provider = 'steam' then
    raise exception 'Steam competitive identity cannot be deleted';
  end if;
  return old;
end;
$$;

create trigger competitive_identities_prevent_steam_delete
before delete on public.competitive_identities
for each row execute function public.prevent_steam_identity_deletion();

alter table public.competitive_identities enable row level security;
alter table public.player_competitive_state enable row level security;

create policy "Players can read their own competitive identities"
  on public.competitive_identities
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Players can read their own competitive state"
  on public.player_competitive_state
  for select
  to authenticated
  using (auth.uid() = user_id);

-- No browser write policies are intentionally created. Identity verification,
-- bans, RSI and confidence remain server-owned operations.
