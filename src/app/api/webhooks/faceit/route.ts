import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { requireRuntimeEnvValue } from "@/lib/env/runtime";
import { safeSecretEqual } from "@/lib/security/safe-secret";

const SECURITY_HEADER = "x-rioesports-webhook-secret";

async function isAuthorized(request: NextRequest) {
  const expected = await requireRuntimeEnvValue("FACEIT_WEBHOOK_SECRET");
  return safeSecretEqual(expected, request.headers.get(SECURITY_HEADER));
}

async function sha256Hex(value: string) {
  const encoded = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function getAdminClient() {
  const [url, serviceRoleKey] = await Promise.all([
    requireRuntimeEnvValue("NEXT_PUBLIC_SUPABASE_URL"),
    requireRuntimeEnvValue("SUPABASE_SERVICE_ROLE_KEY"),
  ]);

  return createSupabaseClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function POST(request: NextRequest) {
  try {
    if (!(await isAuthorized(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } catch (error) {
    console.error("FACEIT webhook authorization configuration failed", error);
    return NextResponse.json({ error: "Webhook temporarily unavailable" }, { status: 503 });
  }

  const rawBody = await request.text();
  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const eventType = (typeof payload.event === "string" && payload.event) || (typeof payload.type === "string" && payload.type) || null;
  const fingerprint = await sha256Hex(rawBody);

  try {
    const supabase = await getAdminClient();
    const { error } = await supabase.from("faceit_webhook_events").upsert(
      { event_fingerprint: fingerprint, event_type: eventType, payload },
      { onConflict: "event_fingerprint", ignoreDuplicates: true },
    );
    if (error) throw error;
    return NextResponse.json({ received: true }, { status: 202 });
  } catch (error) {
    console.error("FACEIT webhook persistence failed", error);
    return NextResponse.json({ error: "Webhook temporarily unavailable" }, { status: 503 });
  }
}

export async function GET() {
  return NextResponse.json({ status: "ok", provider: "faceit" });
}
