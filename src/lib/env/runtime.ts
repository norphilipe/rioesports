import { getCloudflareContext } from "@opennextjs/cloudflare";

function readProcessEnv(name: string): string | undefined {
  // Dynamic access prevents build-time inlining and preserves runtime configuration.
  return (process.env as Record<string, string | undefined>)[name];
}

export async function getRuntimeEnvValue(name: string): Promise<string | undefined> {
  try {
    const { env } = await getCloudflareContext();
    const value = (env as Record<string, unknown>)[name];
    if (typeof value === "string" && value.length > 0) return value;
  } catch {
    // Local development and build-time execution paths may not have a Worker context.
  }

  return readProcessEnv(name);
}

export async function requireRuntimeEnvValue(name: string): Promise<string> {
  const value = await getRuntimeEnvValue(name);
  if (!value) throw new Error(`${name} is not configured.`);
  return value;
}
