import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hasPublicSupabaseRuntimeEnv } from "@/lib/env/public-runtime";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks: Record<string, "ok" | "error"> = {};
  checks.supabase_env = await hasPublicSupabaseRuntimeEnv() ? "ok" : "error";

  if (checks.supabase_env === "ok") {
    try {
      const supabase = await createClient();
      const { error } = await supabase.from("games").select("id", { head: true, count: "exact" }).limit(1);
      if (error) throw error;
      checks.database = "ok";
    } catch {
      checks.database = "error";
    }
  } else {
    checks.database = "error";
  }

  const ok = Object.values(checks).every((status) => status === "ok");
  return NextResponse.json({ ok, checks }, { status: ok ? 200 : 503 });
}
