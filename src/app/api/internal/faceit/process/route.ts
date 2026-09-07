import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { classifyFaceitEvent, extractFaceitEntityId } from "@/lib/faceit/events";
import { synchronizeAndQueueFaceitEvent } from "@/lib/faceit/sync-and-project";
import { requireRuntimeEnvValue } from "@/lib/env/runtime";

async function getAdminClient() {
  const [url, serviceRoleKey] = await Promise.all([
    requireRuntimeEnvValue("NEXT_PUBLIC_SUPABASE_URL"),
    requireRuntimeEnvValue("SUPABASE_SERVICE_ROLE_KEY"),
  ]);

  return createSupabaseClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function isAuthorized(request: NextRequest) {
  const secret = await requireRuntimeEnvValue("FACEIT_PROCESSOR_SECRET");
  const received = request.headers.get("x-rioesports-processor-secret");
  return Boolean(received && secret === received);
}

export async function POST(request: NextRequest) {
  try {
    if (!(await isAuthorized(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } catch (error) {
    console.error("FACEIT processor authorization configuration failed", error);
    return NextResponse.json({ error: "Processor temporarily unavailable" }, { status: 503 });
  }

  try {
    const supabase = await getAdminClient();
    const { data: events, error } = await supabase
      .from("faceit_webhook_events")
      .select("id,event_type,payload,processing_attempts")
      .eq("processing_status", "pending")
      .order("received_at", { ascending: true })
      .limit(20);
    if (error) throw error;

    const results = [];
    for (const event of events ?? []) {
      const eventType = event.event_type as string | null;
      const payload = event.payload;
      const kind = classifyFaceitEvent(eventType);
      const entityId = extractFaceitEntityId(payload);
      const attempts = Number(event.processing_attempts ?? 0) + 1;

      await supabase.from("faceit_webhook_events").update({
        event_kind: kind,
        entity_id: entityId,
        processing_status: "processing",
        processing_attempts: attempts,
      }).eq("id", event.id);

      try {
        const sync = await synchronizeAndQueueFaceitEvent(eventType, payload);
        await supabase.from("faceit_webhook_events").update({
          processing_status: sync.action === "ignored" ? "ignored" : "processed",
          processed_at: new Date().toISOString(),
        }).eq("id", event.id);
        results.push({ id: event.id, status: "processed", action: sync.action });
      } catch (processingError) {
        await supabase.from("faceit_webhook_events").update({ processing_status: "failed" }).eq("id", event.id);
        results.push({ id: event.id, status: "failed" });
        console.error("FACEIT event processing failed", processingError);
      }
    }

    return NextResponse.json({ processed: results.length, results });
  } catch (error) {
    console.error("FACEIT processor failed", error);
    return NextResponse.json({ error: "Processor temporarily unavailable" }, { status: 503 });
  }
}
