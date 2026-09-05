-- ============================================================
-- RIO ESPORTS
-- Migration 013 - Verified FACEIT identity linking
-- ============================================================

create or replace function public.link_verified_faceit_identity(
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
  owner_identity public.competitive_identities;
  user_identity public.competitive_identities;
  linked_identity public.competitive_identities;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  if target_external_id is null or length(trim(target_external_id)) = 0 then
    raise exception 'Invalid FACEIT identity';
  end if;

  select *
  into owner_identity
  from public.competitive_identities
  where provider = 'faceit'
    and external_id = target_external_id;

  if found and owner_identity.user_id <> current_user_id then
    raise exception 'FACEIT account is already linked to another Rio Esports user';
  end if;

  select *
  into user_identity
  from public.competitive_identities
  where user_id = current_user_id
    and provider = 'faceit';

  if found then
    update public.competitive_identities
    set external_id = target_external_id,
        external_username = coalesce(target_external_username, external_username),
        status = 'verified',
        data_available = true,
        verified_at = coalesce(verified_at, now()),
        last_verified_at = now(),
        last_sync_at = now()
    where id = user_identity.id
    returning * into linked_identity;
  else
    insert into public.competitive_identities (
      user_id,
      provider,
      external_id,
      external_username,
      status,
      data_available,
      verified_at,
      last_verified_at,
      last_sync_at
    )
    values (
      current_user_id,
      'faceit',
      target_external_id,
      target_external_username,
      'verified',
      true,
      now(),
      now(),
      now()
    )
    returning * into linked_identity;
  end if;

  perform public.refresh_player_rsi_confidence(current_user_id);
  return linked_identity;
end;
$$;

grant execute on function public.link_verified_faceit_identity(text, text) to authenticated;
