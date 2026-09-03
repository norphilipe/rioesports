-- Profile editing already uses the existing owner-only UPDATE policy on profiles.
-- This RPC safely allows authenticated players to claim optional competitive identities.

create or replace function public.link_optional_competitive_identity(
  target_provider text,
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
  normalized_provider text := lower(trim(target_provider));
  normalized_external_id text := nullif(trim(target_external_id), '');
  normalized_external_username text := nullif(trim(target_external_username), '');
  linked_identity public.competitive_identities;
begin
  if current_user_id is null then
    raise exception 'Authentication is required';
  end if;

  if normalized_provider not in ('faceit', 'leetify') then
    raise exception 'Only optional providers can be linked with this function';
  end if;

  if normalized_external_id is null or char_length(normalized_external_id) > 255 then
    raise exception 'Invalid external identity';
  end if;

  insert into public.competitive_identities (
    user_id, provider, external_id, external_username, status, data_available,
    linked_at, verified_at, last_verified_at, last_sync_at, metadata, updated_at
  ) values (
    current_user_id, normalized_provider, normalized_external_id,
    coalesce(normalized_external_username, normalized_external_id), 'pending', false,
    now(), null, null, null,
    jsonb_build_object('link_method', 'user_claim', 'linked_from_profile', true), now()
  )
  on conflict (user_id, provider) do update
  set external_id = excluded.external_id,
      external_username = excluded.external_username,
      status = 'pending',
      data_available = false,
      verified_at = null,
      last_verified_at = null,
      last_sync_at = null,
      metadata = excluded.metadata,
      updated_at = now()
  returning * into linked_identity;

  perform public.refresh_player_rsi_confidence(current_user_id);
  return linked_identity;
end;
$$;

revoke all on function public.link_optional_competitive_identity(text, text, text) from public;
grant execute on function public.link_optional_competitive_identity(text, text, text) to authenticated;
