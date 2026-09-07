import { NextRequest, NextResponse } from "next/server";
import { requireRuntimeEnvValue } from "@/lib/env/runtime";
import { safeSecretEqual } from "@/lib/security/safe-secret";

export async function GET(request: NextRequest) {
  try {
    const cronSecret = await requireRuntimeEnvValue("CRON_SECRET");
    const authorization = request.headers.get("authorization");

    if (!safeSecretEqual(`Bearer ${cronSecret}`, authorization)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const processorSecret = await requireRuntimeEnvValue("FACEIT_PROCESSOR_SECRET");
    const origin = request.nextUrl.origin;
    const headers = { "x-rioesports-processor-secret": processorSecret };

    const [eventsResponse, projectionsResponse] = await Promise.all([
      fetch(new URL("/api/internal/faceit/process", origin), {
        method: "POST",
        headers,
      }),
      fetch(new URL("/api/internal/faceit/project", origin), {
        method: "POST",
        headers,
      }),
    ]);

    const events = await eventsResponse.json().catch(() => null);
    const projections = await projectionsResponse.json().catch(() => null);

    if (!eventsResponse.ok || !projectionsResponse.ok) {
      return NextResponse.json(
        {
          error: "FACEIT processing failed",
          events,
          projections,
        },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true, events, projections });
  } catch (error) {
    console.error("FACEIT cron trigger failed", error);
    return NextResponse.json({ error: "Cron temporarily unavailable" }, { status: 503 });
  }
}
