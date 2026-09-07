-- RIO ESPORTS
-- Migration 014 - Platform news access and administration policies

alter table public.platform_news enable row level security;

-- Public visitors may only read news that has actually been published.
drop policy if exists "public can view published platform news" on public.platform_news;
create policy "public can view published platform news"
on public.platform_news
for select
to anon, authenticated
using (
  published_at is not null
  and published_at <= timezone('utc', now())
);

-- Platform administrators can manage the complete editorial catalog, including drafts.
drop policy if exists "platform admins can view all platform news" on public.platform_news;
create policy "platform admins can view all platform news"
on public.platform_news
for select
to authenticated
using ((select private.is_platform_admin((select auth.uid()))));

drop policy if exists "platform admins can create platform news" on public.platform_news;
create policy "platform admins can create platform news"
on public.platform_news
for insert
to authenticated
with check (
  author_id = (select auth.uid())
  and (select private.is_platform_admin((select auth.uid())))
);

drop policy if exists "platform admins can update platform news" on public.platform_news;
create policy "platform admins can update platform news"
on public.platform_news
for update
to authenticated
using ((select private.is_platform_admin((select auth.uid()))))
with check ((select private.is_platform_admin((select auth.uid()))));

drop policy if exists "platform admins can delete platform news" on public.platform_news;
create policy "platform admins can delete platform news"
on public.platform_news
for delete
to authenticated
using ((select private.is_platform_admin((select auth.uid()))));

create index if not exists platform_news_published_at_idx
  on public.platform_news(published_at desc)
  where published_at is not null;
