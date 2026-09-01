-- Steam competitive identity linking
-- This RPC is the only authenticated path used by the application to persist
-- a Steam identity. It prevents users from replacing or transferring an
-- existing Steam competitive identity.

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
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  if target_external_id !~ '^[0-9]{17}$' then
    raise exception 'Invalid SteamID64';
  end if;

  select *
  into existing_identity
  from public.competitive_identities
  where user_id = current_user_id
    and provider = 'steam';

  if found then
    if existing_identity.external_id <> target_external_id then
      raise exception 'Steam competitive identity is permanent and cannot be replaced';
    end if;

    update public.competitive_identities
    set external_username = coalesce(target_external_username, external_username),
        status = 'verified',
        data_available = true,
        verified_at = coalesce(verified_at, now()),
        last_verified_at = now()
    where id = existing_identity.id
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
      last_verified_at
    )
    values (
      current_user_id,
      'steam',
      target_external_id,
      target_external_username,
      'verified',
      true,
      now(),
      now()
    )
    returning * into linked_identity;
  end if;

  perform public.refresh_player_rsi_confidence(current_user_id);
  return linked_identity;
end;
$$;

grant execute on function public.link_verified_steam_identity(text, text) to authenticated;
