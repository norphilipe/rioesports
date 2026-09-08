import { getRuntimeEnvValue } from "@/lib/env/runtime";

export function getPublicSupabaseEnvSync() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl) throw new Error("NEXT_PUBLIC_SUPABASE_URL is not configured.");
  if (!supabasePublishableKey) throw new Error("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is not configured.");

  return { supabaseUrl, supabasePublishableKey };
}

export async function getPublicSupabaseEnv() {
  const [supabaseUrl, supabasePublishableKey] = await Promise.all([
    getRuntimeEnvValue("NEXT_PUBLIC_SUPABASE_URL"),
    getRuntimeEnvValue("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
  ]);

  if (!supabaseUrl) throw new Error("NEXT_PUBLIC_SUPABASE_URL is not configured.");
  if (!supabasePublishableKey) throw new Error("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is not configured.");

  return { supabaseUrl, supabasePublishableKey };
}
