import { getRuntimeEnvValue } from "@/lib/env/runtime";

async function requireRuntimeValue(name: string): Promise<string> {
  const value = await getRuntimeEnvValue(name);
  if (value) return value;
  throw new Error(`${name} is not configured.`);
}

export async function getServerSupabaseEnv() {
  const [supabaseUrl, supabasePublishableKey] = await Promise.all([
    requireRuntimeValue("NEXT_PUBLIC_SUPABASE_URL"),
    requireRuntimeValue("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
  ]);

  return { supabaseUrl, supabasePublishableKey };
}
