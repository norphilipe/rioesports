import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getRuntimeEnvValue } from "@/lib/env/runtime";

export const dynamic = "force-dynamic";

export async function GET() {
  const [supabaseUrl, serviceRoleKey, faceitClientId, faceitRedirectUri, faceitClientSecret] = await Promise.all([
    getRuntimeEnvValue("NEXT_PUBLIC_SUPABASE_URL"),
    getRuntimeEnvValue("SUPABASE_SERVICE_ROLE_KEY"),
    getRuntimeEnvValue("FACEIT_OAUTH_CLIENT_ID"),
    getRuntimeEnvValue("FACEIT_OAUTH_REDIRECT_URI"),
    getRuntimeEnvValue("FACEIT_OAUTH_CLIENT_SECRET"),
  ]);

  const checks: Record<string, "ok" | "error"> = {
    supabase_env: Boolean(supabaseUrl && serviceRoleKey) ? "ok" : "error",
    faceit_oauth: Boolean(faceitClientId && faceitRedirectUri && faceitClientSecret) ? "ok" : "error",
  };

  if (checks.supabase_env === "ok") {
    try {
      const supabase = createClient(supabaseUrl!, serviceRoleKey!, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      const [{ error: gamesError }, { error: faceitEventsError }, { error: projectionJobsError }] = await Promise.all([
        supabase.from("games").select("id", { head: true, count: "exact" }).limit(1),
        supabase.from("faceit_webhook_events").select("id", { head: true, count: "exact" }).limit(1),
        supabase.from("faceit_projection_jobs").select("id", { head: true, count: "exact" }).limit(1),
      ]);

      checks.database = gamesError ? "error" : "ok";
      checks.faceit_schema = faceitEventsError || projectionJobsError ? "error" : "ok";
    } catch {
      checks.database = "error";
      checks.faceit_schema = "error";
    }
  } else {
    checks.database = "error";
    checks.faceit_schema = "error";
  }

  const ok = Object.values(checks).every((status) => status === "ok");
  return NextResponse.json({ ok, checks }, { status: ok ? 200 : 503 });
}
