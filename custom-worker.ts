// @ts-ignore .open-next/worker.js is generated during the OpenNext build.
import { default as handler } from "./.open-next/worker.js";

interface Env {
  FACEIT_PROCESSOR_SECRET?: string;
}

const PROCESSOR_CRON = "*/5 * * * *";
const PROJECTOR_CRON = "*/5 * * * *";

async function triggerProcessor(path: string, env: Env): Promise<void> {
  const secret = env.FACEIT_PROCESSOR_SECRET;
  if (!secret) {
    console.error("FACEIT_PROCESSOR_SECRET is not configured.");
    return;
  }

  const response = await handler.fetch(
    new Request(`https://rioesports.com.br${path}`, {
      method: "POST",
      headers: {
        "x-rioesports-processor-secret": secret,
      },
    }),
    env,
    new ExecutionContext(),
  );

  if (!response.ok) {
    throw new Error(`Scheduled request to ${path} failed with ${response.status}.`);
  }
}

export default {
  fetch: handler.fetch,

  async scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext) {
    const tasks: Promise<void>[] = [];

    if (controller.cron === PROCESSOR_CRON) {
      tasks.push(triggerProcessor("/api/internal/faceit/process", env));
    }

    if (controller.cron === PROJECTOR_CRON) {
      tasks.push(triggerProcessor("/api/internal/faceit/project", env));
    }

    if (tasks.length > 0) {
      ctx.waitUntil(Promise.all(tasks));
    }
  },
} satisfies ExportedHandler<Env>;
