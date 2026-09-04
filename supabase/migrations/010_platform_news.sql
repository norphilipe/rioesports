-- ============================================================
-- RIO ESPORTS
-- Migration 010 - Platform news and editorial operations
-- ============================================================

create table if not exists public.news_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 180),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  excerpt text,
  content text not null,
  cover_image_url text,
  status text not null default 'draft'
    check (status in ('draft', 'published', 'scheduled')),
  published_at timestamptz,
  scheduled_at timestamptz,
  author_id uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint news_schedule_consistency check (
    (status = 'published' and published_at is not null)
    or (status = 'scheduled' and scheduled_at is not null)
    or status = 'draft'
  )
);

create index if not exists news_posts_public_idx
  on public.news_posts (status, published_at desc);

create index if not exists news_posts_slug_idx
  on public.news_posts (slug);

alter table public.news_posts enable row level security;

create policy "Public can view published news"
on public.news_posts
for select
using (status = 'published' and published_at <= now());

create policy "Platform admins can view all news"
on public.news_posts
for select
to authenticated
using ((select private.is_platform_admin((select auth.uid()))));

create policy "Platform admins can create news"
on public.news_posts
for insert
to authenticated
with check (
  author_id = (select auth.uid())
  and (select private.is_platform_admin((select auth.uid())))
);

create policy "Platform admins can update news"
on public.news_posts
for update
to authenticated
using ((select private.is_platform_admin((select auth.uid()))))
with check ((select private.is_platform_admin((select auth.uid()))));

create policy "Platform admins can delete news"
on public.news_posts
for delete
to authenticated
using ((select private.is_platform_admin((select auth.uid()))));

grant select, insert, update, delete on public.news_posts to authenticated;

create or replace function public.touch_news_posts_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger news_posts_touch_updated_at
before update on public.news_posts
for each row execute function public.touch_news_posts_updated_at();
