function getRuntimeEnv(name: string): string | undefined {
  // Dynamic lookup prevents NEXT_PUBLIC_* values from being baked in as build-time
  // constants, allowing Cloudflare Worker runtime variables to be read after deploy.
  return process.env[name];
}

export function getPublicSupabaseEnv() {
  const supabaseUrl = getRuntimeEnv("NEXT_PUBLIC_SUPABASE_URL");
  const supabasePublishableKey = getRuntimeEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");

  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not configured.");
  }

  if (!supabasePublishableKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is not configured.");
  }

  return {
    supabaseUrl,
    supabasePublishableKey,
  };
}
