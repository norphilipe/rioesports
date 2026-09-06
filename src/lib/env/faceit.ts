import { getCloudflareContext } from "@opennextjs/cloudflare";

function readProcessEnv(name: string): string | undefined {
  // Dynamic access prevents Next.js from resolving these values at build time.
  return (process.env as Record<string, string | undefined>)[name];
}

async function readRuntimeEnv(name: string): Promise<string | undefined> {
  try {
    const { env } = await getCloudflareContext();
    const value = (env as Record<string, unknown>)[name];
    if (typeof value === "string" && value.length > 0) return value;
  } catch {
    // Local development may not have a Cloudflare runtime context.
  }

  return readProcessEnv(name);
}

async function requireFaceitValue(name: string): Promise<string> {
  const value = await readRuntimeEnv(name);
  if (!value) throw new Error(`${name} is not configured.`);
  return value;
}

export async function getFaceitStartConfig() {
  return {
    clientId: await requireFaceitValue("FACEIT_OAUTH_CLIENT_ID"),
    redirectUri: await requireFaceitValue("FACEIT_OAUTH_REDIRECT_URI"),
  };
}

export async function getFaceitCallbackConfig() {
  return {
    clientId: await requireFaceitValue("FACEIT_OAUTH_CLIENT_ID"),
    clientSecret: await requireFaceitValue("FACEIT_OAUTH_CLIENT_SECRET"),
    redirectUri: await requireFaceitValue("FACEIT_OAUTH_REDIRECT_URI"),
  };
}
