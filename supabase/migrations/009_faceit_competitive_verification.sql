-- FACEIT competitive identity linking
-- FACEIT is bound to the verified Steam identity. Once verified, the external
-- FACEIT identity cannot be silently replaced by another account.

create or replace function public.link_verified_faceit_identity(
  target_external_id text,
  target_external_username text,
  target_data_available boolean default true
)
returns public.competitive_identities
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  steam_identity public.competitive_identities;
  existing_identity public.competitive_identities;
  linked_identity public.competitive_identities;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  if target_external_id is null or length(trim(target_external_id)) = 0 then
    raise exception 'FACEIT player id is required';
  end if;

  select * into steam_identity
  from public.competitive_identities
  where user_id = current_user_id and provider = 'steam' and status = 'verified';

  if not found then
    raise exception 'A verified Steam identity is required before linking FACEIT';
  end if;

  select * into existing_identity
  from public.competitive_identities
  where user_id = current_user_id and provider = 'faceit';

  if found and existing_identity.external_id <> target_external_id then
    raise exception 'FACEIT competitive identity cannot be replaced';
  end if;

  if found then
    update public.competitive_identities
    set external_username = coalesce(target_external_username, external_username),
        status = 'verified', data_available = target_data_available,
        verified_at = coalesce(verified_at, now()), last_verified_at = now(), last_sync_at = now()
    where id = existing_identity.id
    returning * into linked_identity;
  else
    insert into public.competitive_identities (
      user_id, provider, external_id, external_username, status, data_available,
      verified_at, last_verified_at, last_sync_at
    )
    values (
      current_user_id, 'faceit', target_external_id, target_external_username,
      'verified', target_data_available, now(), now(), now()
    )
    returning * into linked_identity;
  end if;

  perform public.refresh_player_rsi_confidence(current_user_id);
  return linked_identity;
end;
$$;

grant execute on function public.link_verified_faceit_identity(text, text, boolean) to authenticated;

create or replace function public.prevent_verified_faceit_identity_replacement()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' and old.provider = 'faceit' and old.status = 'verified'
    and new.external_id is distinct from old.external_id then
    raise exception 'Verified FACEIT competitive identity cannot be replaced';
  end if;
  return new;
end;
$$;

create trigger competitive_identities_prevent_faceit_replacement
before update on public.competitive_identities
for each row execute function public.prevent_verified_faceit_identity_replacement();
