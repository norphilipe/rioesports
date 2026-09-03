-- Production-compatible repair for Steam identity linking.
-- Keeps the application migration history aligned with the production schema.

create or replace function public.calculate_rsi_confidence(target_user_id uuid)
returns table(score integer, level text)
language sql
stable
set search_path = public
as $$
  with identities as (
    select provider, status, data_available
    from public.competitive_identities
    where user_id = target_user_id
  ), source_state as (
    select
      exists (select 1 from identities where provider = 'steam' and status = 'verified') as steam_verified,
      exists (select 1 from identities where provider = 'faceit' and status = 'verified' and data_available) as faceit_usable,
      exists (select 1 from identities where provider = 'leetify' and status = 'verified' and data_available) as leetify_usable
  )
  select
    case when steam_verified and faceit_usable and leetify_usable then 100
         when steam_verified and faceit_usable then 65
         when steam_verified then 30 else 0 end,
    case when steam_verified and faceit_usable and leetify_usable then 'high'
         when steam_verified and faceit_usable then 'medium' else 'low' end
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
  next_level text;
  next_state public.player_competitive_state;
begin
  select score, level into next_score, next_level
  from public.calculate_rsi_confidence(target_user_id);

  insert into public.player_competitive_state (user_id, confidence_score, confidence_level, calculated_at)
  values (target_user_id, coalesce(next_score, 0), coalesce(next_level, 'low'), now())
  on conflict (user_id) do update
  set confidence_score = excluded.confidence_score,
      confidence_level = excluded.confidence_level,
      calculated_at = excluded.calculated_at
  returning * into next_state;

  return next_state;
end;
$$;

create or replace function public.link_verified_steam_identity(
  target_external_id text,
  target_external_username text default null
)
returns public.competitive_identities
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  existing_identity public.competitive_identities;
  linked_identity public.competitive_identities;
begin
  if current_user_id is null then raise exception 'Authentication required'; end if;
  if target_external_id !~ '^[0-9]{17}$' then raise exception 'Invalid SteamID64'; end if;

  select * into existing_identity
  from public.competitive_identities
  where user_id = current_user_id and provider = 'steam';

  if found then
    if existing_identity.external_id <> target_external_id then
      raise exception 'Steam competitive identity is permanent and cannot be replaced';
    end if;

    update public.competitive_identities
    set external_username = coalesce(target_external_username, external_username),
        status = 'verified', data_available = true,
        verified_at = coalesce(verified_at, now()), last_verified_at = now(), updated_at = now()
    where id = existing_identity.id
    returning * into linked_identity;
  else
    insert into public.competitive_identities (
      user_id, provider, external_id, external_username, status,
      data_available, verified_at, last_verified_at, created_at, updated_at
    ) values (
      current_user_id, 'steam', target_external_id, target_external_username,
      'verified', true, now(), now(), now(), now()
    ) returning * into linked_identity;
  end if;

  perform public.refresh_player_rsi_confidence(current_user_id);
  return linked_identity;
end;
$$;

revoke all on function public.link_verified_steam_identity(text, text) from public;
grant execute on function public.link_verified_steam_identity(text, text) to authenticated;
revoke all on function public.refresh_player_rsi_confidence(uuid) from public;
revoke all on function public.calculate_rsi_confidence(uuid) from public;
