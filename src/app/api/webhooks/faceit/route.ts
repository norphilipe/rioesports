import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createHash, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const SECURITY_HEADER = "x-rioesports-webhook-secret";

function isAuthorized(request: NextRequest) {
  const expected = process.env.FACEIT_WEBHOOK_SECRET;
  const received = request.headers.get(SECURITY_HEADER);

  if (!expected || !received) return false;

  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(received);

  return (
    expectedBuffer.length === receivedBuffer.length &&
    timingSafeEqual(expectedBuffer, receivedBuffer)
  );
}

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("FACEIT webhook persistence is not configured.");
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rawBody = await request.text();
  let payload: Record<string, unknown>;

  try {
    payload = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const eventType =
    (typeof payload.event === "string" && payload.event) ||
    (typeof payload.type === "string" && payload.type) ||
    null;

  const fingerprint = createHash("sha256").update(rawBody).digest("hex");

  try {
    const supabase = getAdminClient();
    const { error } = await supabase
      .from("faceit_webhook_events")
      .upsert(
        {
          event_fingerprint: fingerprint,
          event_type: eventType,
          payload,
        },
        { onConflict: "event_fingerprint", ignoreDuplicates: true },
      );

    if (error) throw error;

    return NextResponse.json({ received: true }, { status: 202 });
  } catch (error) {
    console.error("FACEIT webhook persistence failed", error);
    return NextResponse.json(
      { error: "Webhook temporarily unavailable" },
      { status: 503 },
    );
  }
}

export async function GET() {
  return NextResponse.json({ status: "ok", provider: "faceit" });
}
