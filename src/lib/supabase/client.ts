import { createBrowserClient } from "@supabase/ssr";
import { getPublicSupabaseEnv } from "@/lib/env";

export function createClient() {
  const { supabaseUrl, supabasePublishableKey } = getPublicSupabaseEnv();

  return createBrowserClient(supabaseUrl, supabasePublishableKey);
}
