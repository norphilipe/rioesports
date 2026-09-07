import { NextRequest, NextResponse } from "next/server";
import { processFaceitEvents, processFaceitProjections } from "@/lib/faceit/background";
import { requireRuntimeEnvValue } from "@/lib/env/runtime";
import { safeSecretEqual } from "@/lib/security/safe-secret";

export async function GET(request: NextRequest) {
  try {
    const cronSecret = await requireRuntimeEnvValue("CRON_SECRET");
    const authorization = request.headers.get("authorization");

    if (!safeSecretEqual(`Bearer ${cronSecret}`, authorization)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [events, projections] = await Promise.allSettled([
      processFaceitEvents(),
      processFaceitProjections(),
    ]);

    const eventsResult = events.status === "fulfilled"
      ? events.value
      : { error: events.reason instanceof Error ? events.reason.message : "Event processor failed" };
    const projectionsResult = projections.status === "fulfilled"
      ? projections.value
      : { error: projections.reason instanceof Error ? projections.reason.message : "Projection processor failed" };

    if (events.status !== "fulfilled" || projections.status !== "fulfilled") {
      return NextResponse.json(
        { error: "FACEIT processing failed", events: eventsResult, projections: projectionsResult },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true, events: eventsResult, projections: projectionsResult });
  } catch (error) {
    console.error("FACEIT cron trigger failed", error);
    return NextResponse.json({ error: "Cron temporarily unavailable" }, { status: 503 });
  }
}
