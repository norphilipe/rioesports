import { getCloudflareContext } from "@opennextjs/cloudflare";

function requireRuntimeValue(name: string, value: unknown): string {
  if (typeof value === "string" && value.length > 0) {
    return value;
  }

  throw new Error(`${name} is not configured.`);
}

function readProcessEnv(name: string): unknown {
  // Dynamic access is intentional: Next.js can inline direct
  // process.env.NEXT_PUBLIC_* references during the build, while these
  // values must remain available from the Cloudflare Worker at runtime.
  return (process.env as Record<string, string | undefined>)[name];
}

export async function getServerSupabaseEnv() {
  const { env } = await getCloudflareContext();
  const runtimeEnv = env as Record<string, unknown>;

  const readRuntimeEnv = (name: string) => runtimeEnv[name] ?? readProcessEnv(name);

  return {
    supabaseUrl: requireRuntimeValue(
      "NEXT_PUBLIC_SUPABASE_URL",
      readRuntimeEnv("NEXT_PUBLIC_SUPABASE_URL"),
    ),
    supabasePublishableKey: requireRuntimeValue(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      readRuntimeEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
    ),
  };
}
