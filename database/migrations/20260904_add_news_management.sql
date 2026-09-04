create table if not exists public.news_articles (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 180),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  excerpt text not null default '',
  content text not null default '',
  status text not null default 'draft' check (status in ('draft','published','scheduled')),
  cover_image_url text,
  author_id uuid not null references public.profiles(id) on delete restrict default auth.uid(),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists news_articles_status_published_at_idx on public.news_articles (status, published_at desc);
create index if not exists news_articles_slug_idx on public.news_articles (slug);

alter table public.news_articles enable row level security;

create policy "Public can read published news" on public.news_articles
  for select using (status = 'published' and published_at is not null and published_at <= now());

create policy "Admins can manage news" on public.news_articles
  for all to authenticated using (public.is_platform_admin()) with check (public.is_platform_admin());

create or replace function public.set_news_articles_updated_at()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists news_articles_updated_at on public.news_articles;
create trigger news_articles_updated_at
before update on public.news_articles
for each row execute function public.set_news_articles_updated_at();
