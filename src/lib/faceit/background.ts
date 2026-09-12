import { createClient } from "@supabase/supabase-js";
import { requireRuntimeEnvValue } from "@/lib/env/runtime";
import { classifyFaceitEvent, extractFaceitEntityId } from "@/lib/faceit/events";
import { synchronizeAndQueueFaceitEvent } from "@/lib/faceit/sync-and-project";
import { notifyRjvalsMatch } from "@/lib/rjvals/discord-notifications";

async function getAdminClient() {
  const [url, serviceRoleKey] = await Promise.all([
    requireRuntimeEnvValue("NEXT_PUBLIC_SUPABASE_URL"),
    requireRuntimeEnvValue("SUPABASE_SERVICE_ROLE_KEY"),
  ]);
  return createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
}

async function reclaimStaleJobs(supabase: Awaited<ReturnType<typeof getAdminClient>>) {
  const staleBefore = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const [{ error: eventError }, { error: projectionError }] = await Promise.all([
    supabase.from("faceit_webhook_events").update({ processing_status: "pending" }).eq("processing_status", "processing").lt("received_at", staleBefore),
    supabase.from("faceit_projection_jobs").update({ status: "pending" }).eq("status", "processing").lt("created_at", staleBefore),
  ]);
  if (eventError) throw eventError;
  if (projectionError) throw projectionError;
}

export async function processFaceitEvents() {
  const supabase = await getAdminClient();
  await reclaimStaleJobs(supabase);
  const { data: events, error } = await supabase.from("faceit_webhook_events").select("id,event_type,payload,processing_attempts").eq("processing_status", "pending").order("received_at", { ascending: true }).limit(20);
  if (error) throw error;
  const results: Array<{ id: string; status: "processed" | "failed"; action?: string }> = [];
  for (const event of events ?? []) {
    const eventType = event.event_type as string | null;
    const payload = event.payload;
    const attempts = Number(event.processing_attempts ?? 0) + 1;
    const { data: claimed, error: claimError } = await supabase.from("faceit_webhook_events").update({ event_kind: classifyFaceitEvent(eventType), entity_id: extractFaceitEntityId(payload), processing_status: "processing", processing_attempts: attempts }).eq("id", event.id).eq("processing_status", "pending").select("id").maybeSingle();
    if (claimError) throw claimError;
    if (!claimed) continue;
    try {
      const sync = await synchronizeAndQueueFaceitEvent(eventType, payload);
      const entityId = extractFaceitEntityId(payload);

      // Discord is an optional side effect: a Discord outage/configuration issue must never
      // prevent the FACEIT event from being marked processed.
      if (entityId && classifyFaceitEvent(eventType) === "match" && (sync.action === "match_changed" || sync.action === "match_finished")) {
        try {
          await notifyRjvalsMatch(entityId, sync.action === "match_finished");
        } catch (notificationError) {
          console.error("RJVALS Discord notification failed", {
            eventId: event.id,
            matchId: entityId,
            message: notificationError instanceof Error ? notificationError.message : "Unknown Discord error",
          });
        }
      }

      const { error: completeError } = await supabase.from("faceit_webhook_events").update({ processing_status: sync.action === "ignored" ? "ignored" : "processed", processed_at: new Date().toISOString() }).eq("id", event.id);
      if (completeError) throw completeError;
      results.push({ id: event.id, status: "processed", action: sync.action });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Event processing failed";
      const { error: failError } = await supabase.from("faceit_webhook_events").update({ processing_status: "failed", processed_at: new Date().toISOString() }).eq("id", event.id);
      if (failError) throw failError;
      console.error("FACEIT event processing failed", { id: event.id, message });
      results.push({ id: event.id, status: "failed" });
    }
  }
  return { processed: results.length, results };
}

export async function processFaceitProjections() {
  const supabase = await getAdminClient();
  await reclaimStaleJobs(supabase);
  const { data: jobs, error } = await supabase.from("faceit_projection_jobs").select("id,faceit_match_id,attempts").eq("status", "pending").order("created_at", { ascending: true }).limit(20);
  if (error) throw error;
  const results: Array<{ id: string; matchId: string; status: "processed" | "failed" }> = [];
  for (const job of jobs ?? []) {
    const { data: claimed, error: claimError } = await supabase.from("faceit_projection_jobs").update({ status: "processing", attempts: Number(job.attempts ?? 0) + 1 }).eq("id", job.id).eq("status", "pending").select("id").maybeSingle();
    if (claimError) throw claimError;
    if (!claimed) continue;
    try {
      const { data: projection, error: projectionError } = await supabase.from("faceit_match_projections").select("faceit_match_id,status,finished_at,winner_team_id,teams").eq("faceit_match_id", job.faceit_match_id).maybeSingle();
      if (projectionError) throw projectionError;
      if (!projection) throw new Error("Match projection not found.");
      const { error: completeError } = await supabase.from("faceit_projection_jobs").update({ status: "processed", processed_at: new Date().toISOString(), last_error: null }).eq("id", job.id);
      if (completeError) throw completeError;
      results.push({ id: job.id, matchId: projection.faceit_match_id, status: "processed" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Projection failed";
      const { error: failError } = await supabase.from("faceit_projection_jobs").update({ status: "failed", last_error: message }).eq("id", job.id);
      if (failError) throw failError;
      console.error("FACEIT projection processing failed", { id: job.id, message });
      results.push({ id: job.id, matchId: job.faceit_match_id, status: "failed" });
    }
  }
  return { processed: results.length, results };
}
