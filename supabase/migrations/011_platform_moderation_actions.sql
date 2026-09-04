create table if not exists public.user_penalties (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  moderator_id uuid not null references public.profiles(id) on delete restrict,
  penalty_type text not null check (penalty_type in ('warning','suspension','ban')),
  reason text not null check (char_length(reason) between 3 and 1000),
  starts_at timestamptz not null default now(),
  expires_at timestamptz,
  revoked_at timestamptz,
  revoked_by uuid references public.profiles(id) on delete restrict,
  revoke_reason text,
  created_at timestamptz not null default now(),
  constraint penalty_dates_valid check (expires_at is null or expires_at > starts_at)
);

create index if not exists user_penalties_user_created_idx on public.user_penalties(user_id, created_at desc);
create index if not exists user_penalties_active_idx on public.user_penalties(user_id, revoked_at, expires_at);

alter table public.user_penalties enable row level security;

create policy "Users can view own penalties"
on public.user_penalties for select to authenticated
using (user_id = (select auth.uid()));

create policy "Admins can view all penalties"
on public.user_penalties for select to authenticated
using ((select private.is_platform_admin((select auth.uid()))));

create policy "Admins can create penalties"
on public.user_penalties for insert to authenticated
with check (
  moderator_id = (select auth.uid())
  and (select private.is_platform_admin((select auth.uid())))
);

create policy "Admins can update penalties"
on public.user_penalties for update to authenticated
using ((select private.is_platform_admin((select auth.uid()))))
with check ((select private.is_platform_admin((select auth.uid()))));

grant select, insert, update on public.user_penalties to authenticated;

create or replace function public.is_user_competitively_restricted(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_penalties p
    where p.user_id = target_user_id
      and p.revoked_at is null
      and p.penalty_type in ('suspension', 'ban')
      and (p.expires_at is null or p.expires_at > now())
  );
$$;

grant execute on function public.is_user_competitively_restricted(uuid) to authenticated;
