import { getCloudflareContext } from "@opennextjs/cloudflare";

function requireRuntimeValue(name: string, value: unknown): string {
  if (typeof value === "string" && value.length > 0) {
    return value;
  }

  throw new Error(`${name} is not configured.`);
}

export async function getServerSupabaseEnv() {
  const { env } = await getCloudflareContext();
  const runtimeEnv = env as Record<string, unknown>;

  return {
    supabaseUrl: requireRuntimeValue(
      "NEXT_PUBLIC_SUPABASE_URL",
      runtimeEnv.NEXT_PUBLIC_SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL,
    ),
    supabasePublishableKey: requireRuntimeValue(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      runtimeEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    ),
  };
}
