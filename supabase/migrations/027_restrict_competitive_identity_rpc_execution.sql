-- These SECURITY DEFINER functions are only intended for authenticated identity flows.
-- Internal function calls do not require REST-exposed execute permissions.

revoke execute on function public.link_optional_competitive_identity(text, text, text) from anon;
revoke execute on function public.link_verified_steam_identity(text, text) from anon;
revoke execute on function public.refresh_player_rsi_confidence(uuid) from anon, authenticated;

grant execute on function public.link_optional_competitive_identity(text, text, text) to authenticated;
grant execute on function public.link_verified_steam_identity(text, text) to authenticated;
