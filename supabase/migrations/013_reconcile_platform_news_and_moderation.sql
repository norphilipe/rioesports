-- ============================================================
-- RIO ESPORTS
-- Migration 013 - Reconcile platform news and moderation schema
-- ============================================================
-- This migration records schema that was already reconciled in the
-- production Supabase project. It is intentionally idempotent so fresh
-- environments converge safely without changing existing data.

create table if not exists public.platform_news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text not null,
  cover_image_url text,
  author_id uuid references public.profiles(id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.platform_moderation_actions (
  id uuid primary key default gen_random_uuid(),
  target_profile_id uuid not null references public.profiles(id) on delete cascade,
  moderator_profile_id uuid references public.profiles(id) on delete set null,
  action_type text not null,
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.platform_news enable row level security;
alter table public.platform_moderation_actions enable row level security;

create index if not exists platform_news_author_id_idx
  on public.platform_news(author_id);
create index if not exists platform_moderation_actions_target_profile_id_idx
  on public.platform_moderation_actions(target_profile_id);
create index if not exists platform_moderation_actions_moderator_profile_id_idx
  on public.platform_moderation_actions(moderator_profile_id);

drop policy if exists "public can read published platform news" on public.platform_news;
create policy "public can read published platform news"
on public.platform_news
for select
using (published_at is not null and published_at <= now());
