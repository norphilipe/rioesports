import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getRuntimeEnvValue } from "@/lib/env/runtime";

const LEETIFY_API = "https://api-public.cs-prod.leetify.com/v3/profile";

function redirect(request: Request, status: "linked" | "error") {
  const url = new URL("/perfil", request.url);
  url.searchParams.set("leetify", status);
  return NextResponse.redirect(url);
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url));

  const { data: steamIdentity } = await supabase.from("competitive_identities").select("external_id, status, data_available").eq("user_id", user.id).eq("provider", "steam").maybeSingle();
  if (!steamIdentity || steamIdentity.status !== "verified" || !steamIdentity.data_available) return redirect(request, "error");

  const apiKey = await getRuntimeEnvValue("LEETIFY_API_KEY");
  const url = new URL(LEETIFY_API);
  url.searchParams.set("steam64_id", steamIdentity.external_id);

  try {
    const headers: Record<string, string> = { accept: "application/json" };
    if (apiKey) headers.Authorization = `Bearer ${apiKey}`;
    const response = await fetch(url, { headers, cache: "no-store" });
    if (!response.ok) return redirect(request, "error");

    const profile = await response.json() as { id?: string; steam64_id?: string; name?: string };
    if (!profile.id || profile.steam64_id !== steamIdentity.external_id) return redirect(request, "error");

    const { error } = await supabase.rpc("link_verified_leetify_identity", {
      target_external_id: profile.id,
      target_external_username: profile.name ?? profile.id,
    });

    return redirect(request, error ? "error" : "linked");
  } catch (error) {
    console.error("Leetify link failed", error);
    return redirect(request, "error");
  }
}
