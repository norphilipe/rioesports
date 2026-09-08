import { createBrowserClient } from "@supabase/ssr";
import { getPublicSupabaseEnvSync } from "@/lib/env";

export function createClient() {
  const { supabaseUrl, supabasePublishableKey } = getPublicSupabaseEnvSync();

  return createBrowserClient(supabaseUrl, supabasePublishableKey);
}
