import { createBrowserClient } from "@supabase/ssr";
import { getPublicSupabaseEnvSync } from "@/lib/env";

const AUTH_COOKIE_DOMAIN = "rioesports.com.br";

export function createClient() {
  const { supabaseUrl, supabasePublishableKey } = getPublicSupabaseEnvSync();

  return createBrowserClient(supabaseUrl, supabasePublishableKey, {
    cookieOptions: {
      domain: AUTH_COOKIE_DOMAIN,
    },
  });
}
