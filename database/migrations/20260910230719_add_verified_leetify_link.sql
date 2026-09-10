create or replace function public.link_verified_leetify_identity(target_external_id text, target_external_username text default null)
returns public.competitive_identities
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  steam_identity public.competitive_identities;
  linked_identity public.competitive_identities;
  normalized_id text := nullif(trim(target_external_id), '');
  normalized_username text := nullif(trim(target_external_username), '');
begin
  if current_user_id is null then raise exception 'Authentication required'; end if;
  if normalized_id is null or char_length(normalized_id) > 255 then raise exception 'Invalid Leetify identity'; end if;

  select * into steam_identity from public.competitive_identities
  where user_id = current_user_id and provider = 'steam' and status = 'verified' and data_available = true;
  if not found then raise exception 'A verified Steam identity is required'; end if;

  insert into public.competitive_identities (
    user_id, provider, external_id, external_username, status, data_available,
    linked_at, verified_at, last_verified_at, last_sync_at, metadata, updated_at
  ) values (
    current_user_id, 'leetify', normalized_id, coalesce(normalized_username, normalized_id),
    'verified', true, now(), now(), now(), now(),
    jsonb_build_object('link_method', 'verified_steam_match'), now()
  )
  on conflict (user_id, provider) do update
  set external_id = excluded.external_id,
      external_username = excluded.external_username,
      status = 'verified',
      data_available = true,
      verified_at = coalesce(public.competitive_identities.verified_at, now()),
      last_verified_at = now(),
      last_sync_at = now(),
      metadata = excluded.metadata,
      updated_at = now()
  returning * into linked_identity;

  perform public.refresh_player_rsi_confidence(current_user_id);
  return linked_identity;
end;
$$;

grant execute on function public.link_verified_leetify_identity(text, text) to authenticated;
