import { NextRequest, NextResponse } from "next/server";
import { processFaceitProjections } from "@/lib/faceit/background";
import { requireRuntimeEnvValue } from "@/lib/env/runtime";
import { safeSecretEqual } from "@/lib/security/safe-secret";

async function isAuthorized(request: NextRequest) {
  const secret = await requireRuntimeEnvValue("FACEIT_PROCESSOR_SECRET");
  return safeSecretEqual(secret, request.headers.get("x-rioesports-processor-secret"));
}

export async function POST(request: NextRequest) {
  try {
    if (!(await isAuthorized(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } catch (error) {
    console.error("FACEIT projection authorization configuration failed", error);
    return NextResponse.json({ error: "Projection processor temporarily unavailable" }, { status: 503 });
  }

  try {
    return NextResponse.json(await processFaceitProjections());
  } catch (error) {
    console.error("FACEIT projection worker failed", error);
    return NextResponse.json({ error: "Projection processor temporarily unavailable" }, { status: 503 });
  }
}
