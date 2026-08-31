const PUBLIC_ENV = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabasePublishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
} as const;

export function getPublicSupabaseEnv() {
  if (!PUBLIC_ENV.supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not configured.");
  }

  if (!PUBLIC_ENV.supabasePublishableKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is not configured.");
  }

  return {
    supabaseUrl: PUBLIC_ENV.supabaseUrl,
    supabasePublishableKey: PUBLIC_ENV.supabasePublishableKey,
  };
}
