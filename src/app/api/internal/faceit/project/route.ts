import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase projection client is not configured.");
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

function isAuthorized(request: NextRequest) {
  const secret = process.env.FACEIT_PROCESSOR_SECRET;
  return Boolean(secret && request.headers.get("x-rioesports-processor-secret") === secret);
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const supabase = getAdminClient();
    const { data: jobs, error } = await supabase
      .from("faceit_projection_jobs")
      .select("id,faceit_match_id,attempts")
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(20);
    if (error) throw error;

    const results = [];
    for (const job of jobs ?? []) {
      await supabase.from("faceit_projection_jobs").update({ status: "processing", attempts: job.attempts + 1 }).eq("id", job.id);
      try {
        const { data: projection, error: projectionError } = await supabase
          .from("faceit_match_projections")
          .select("faceit_match_id,status,finished_at,winner_team_id,teams")
          .eq("faceit_match_id", job.faceit_match_id)
          .maybeSingle();
        if (projectionError) throw projectionError;
        if (!projection) throw new Error("Match projection not found.");

        await supabase.from("faceit_projection_jobs").update({
          status: "processed",
          processed_at: new Date().toISOString(),
          last_error: null,
        }).eq("id", job.id);
        results.push({ id: job.id, matchId: projection.faceit_match_id, status: "processed" });
      } catch (jobError) {
        await supabase.from("faceit_projection_jobs").update({
          status: "failed",
          last_error: jobError instanceof Error ? jobError.message : "Projection failed",
        }).eq("id", job.id);
        results.push({ id: job.id, status: "failed" });
      }
    }
    return NextResponse.json({ processed: results.length, results });
  } catch (error) {
    console.error("FACEIT projection worker failed", error);
    return NextResponse.json({ error: "Projection processor temporarily unavailable" }, { status: 503 });
  }
}
