import { getRuntimeEnvValue, requireRuntimeEnvValue } from "@/lib/env/runtime";

export async function getPublicSupabaseRuntimeEnv() {
  const [supabaseUrl, supabasePublishableKey] = await Promise.all([
    requireRuntimeEnvValue("NEXT_PUBLIC_SUPABASE_URL"),
    requireRuntimeEnvValue("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
  ]);

  return { supabaseUrl, supabasePublishableKey };
}

export async function hasPublicSupabaseRuntimeEnv() {
  const [supabaseUrl, supabasePublishableKey] = await Promise.all([
    getRuntimeEnvValue("NEXT_PUBLIC_SUPABASE_URL"),
    getRuntimeEnvValue("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
  ]);

  return Boolean(supabaseUrl && supabasePublishableKey);
}
