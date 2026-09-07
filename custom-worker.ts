// @ts-ignore .open-next/worker.js is generated during the OpenNext build.
import { default as handler } from "./.open-next/worker.js";

interface Env {
  FACEIT_PROCESSOR_SECRET?: string;
}

const FACEIT_CRON = "*/5 * * * *";
const BASE_URL = "https://rioesports.com.br";

async function triggerProcessor(path: string, env: Env): Promise<void> {
  const secret = env.FACEIT_PROCESSOR_SECRET;
  if (!secret) {
    throw new Error("FACEIT_PROCESSOR_SECRET is not configured.");
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "x-rioesports-processor-secret": secret,
    },
  });

  if (!response.ok) {
    throw new Error(`Scheduled request to ${path} failed with ${response.status}.`);
  }
}

export default {
  fetch: handler.fetch,

  async scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext) {
    if (controller.cron !== FACEIT_CRON) return;

    ctx.waitUntil(
      Promise.all([
        triggerProcessor("/api/internal/faceit/process", env),
        triggerProcessor("/api/internal/faceit/project", env),
      ]),
    );
  },
} satisfies ExportedHandler<Env>;
