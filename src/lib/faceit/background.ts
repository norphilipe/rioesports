import { createClient } from "@supabase/supabase-js";
import { requireRuntimeEnvValue } from "@/lib/env/runtime";
import { classifyFaceitEvent, extractFaceitEntityId } from "@/lib/faceit/events";
import { synchronizeAndQueueFaceitEvent } from "@/lib/faceit/sync-and-project";

async function getAdminClient() {
  const [url, serviceRoleKey] = await Promise.all([
    requireRuntimeEnvValue("NEXT_PUBLIC_SUPABASE_URL"),
    requireRuntimeEnvValue("SUPABASE_SERVICE_ROLE_KEY"),
  ]);

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function processFaceitEvents() {
  const supabase = await getAdminClient();
  const { data: events, error } = await supabase
    .from("faceit_webhook_events")
    .select("id,event_type,payload,processing_attempts")
    .eq("processing_status", "pending")
    .order("received_at", { ascending: true })
    .limit(20);
  if (error) throw error;

  const results: Array<{ id: string; status: "processed" | "failed"; action?: string }> = [];
  for (const event of events ?? []) {
    const eventType = event.event_type as string | null;
    const payload = event.payload;
    const kind = classifyFaceitEvent(eventType);
    const entityId = extractFaceitEntityId(payload);
    const attempts = Number(event.processing_attempts ?? 0) + 1;

    const { error: claimError } = await supabase.from("faceit_webhook_events").update({
      event_kind: kind,
      entity_id: entityId,
      processing_status: "processing",
      processing_attempts: attempts,
    }).eq("id", event.id).eq("processing_status", "pending");
    if (claimError) throw claimError;

    try {
      const sync = await synchronizeAndQueueFaceitEvent(eventType, payload);
      const { error: completeError } = await supabase.from("faceit_webhook_events").update({
        processing_status: sync.action === "ignored" ? "ignored" : "processed",
        processed_at: new Date().toISOString(),
      }).eq("id", event.id);
      if (completeError) throw completeError;
      results.push({ id: event.id, status: "processed", action: sync.action });
    } catch (error) {
      const { error: failError } = await supabase.from("faceit_webhook_events").update({
        processing_status: "failed",
      }).eq("id", event.id);
      if (failError) throw failError;
      console.error("FACEIT event processing failed", error);
      results.push({ id: event.id, status: "failed" });
    }
  }

  return { processed: results.length, results };
}

export async function processFaceitProjections() {
  const supabase = await getAdminClient();
  const { data: jobs, error } = await supabase
    .from("faceit_projection_jobs")
    .select("id,faceit_match_id,attempts")
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(20);
  if (error) throw error;

  const results: Array<{ id: string; matchId: string; status: "processed" | "failed" }> = [];
  for (const job of jobs ?? []) {
    const { error: claimError } = await supabase
      .from("faceit_projection_jobs")
      .update({ status: "processing", attempts: Number(job.attempts ?? 0) + 1 })
      .eq("id", job.id)
      .eq("status", "pending");
    if (claimError) throw claimError;

    try {
      const { data: projection, error: projectionError } = await supabase
        .from("faceit_match_projections")
        .select("faceit_match_id,status,finished_at,winner_team_id,teams")
        .eq("faceit_match_id", job.faceit_match_id)
        .maybeSingle();
      if (projectionError) throw projectionError;
      if (!projection) throw new Error("Match projection not found.");

      const { error: completeError } = await supabase
        .from("faceit_projection_jobs")
        .update({ status: "processed", processed_at: new Date().toISOString(), last_error: null })
        .eq("id", job.id);
      if (completeError) throw completeError;
      results.push({ id: job.id, matchId: projection.faceit_match_id, status: "processed" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Projection failed";
      const { error: failError } = await supabase
        .from("faceit_projection_jobs")
        .update({ status: "failed", last_error: message })
        .eq("id", job.id);
      if (failError) throw failError;
      console.error("FACEIT projection processing failed", error);
      results.push({ id: job.id, matchId: job.faceit_match_id, status: "failed" });
    }
  }

  return { processed: results.length, results };
}
