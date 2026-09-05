import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { classifyFaceitEvent, extractFaceitEntityId } from "@/lib/faceit/events";
import { synchronizeFaceitEvent } from "@/lib/faceit/sync";

export const runtime = "edge";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) throw new Error("Supabase processing client is not configured.");
  return createSupabaseClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
}

function isAuthorized(request: NextRequest) {
  const secret = process.env.FACEIT_PROCESSOR_SECRET;
  const received = request.headers.get("x-rioesports-processor-secret");
  return Boolean(secret && received && secret === received);
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const supabase = getAdminClient();
    const { data: events, error } = await supabase
      .from("faceit_webhook_events")
      .select("id,event_type,payload")
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

      await supabase.from("faceit_webhook_events").update({
        event_kind: kind,
        entity_id: entityId,
        processing_status: "processing",
        processing_attempts: 1,
      }).eq("id", event.id);

      try {
        const sync = await synchronizeFaceitEvent(eventType, payload);
        await supabase.from("faceit_webhook_events").update({
          processing_status: sync.action === "ignored" ? "ignored" : "processed",
          processed_at: new Date().toISOString(),
        }).eq("id", event.id);
        results.push({ id: event.id, status: "processed", action: sync.action });
      } catch (processingError) {
        await supabase.from("faceit_webhook_events").update({
          processing_status: "failed",
          processing_attempts: 2,
        }).eq("id", event.id);
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
