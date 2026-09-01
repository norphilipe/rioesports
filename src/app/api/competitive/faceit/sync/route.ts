import { NextResponse } from "next/server";
import { getFaceitPlayerBySteamId } from "@/lib/competitive/faceit";
import { createClient } from "@/lib/supabase/server";

function profileRedirect(request: Request, status: string) {
  const url = new URL("/perfil", request.url);
  url.searchParams.set("faceit", status);
  return url;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url));

  const { data: steamIdentity } = await supabase
    .from("competitive_identities")
    .select("external_id, status")
    .eq("user_id", user.id)
    .eq("provider", "steam")
    .maybeSingle();

  if (steamIdentity?.status !== "verified" || !steamIdentity.external_id) {
    return NextResponse.redirect(profileRedirect(request, "steam-required"));
  }

  try {
    const player = await getFaceitPlayerBySteamId(steamIdentity.external_id);
    if (!player) return NextResponse.redirect(profileRedirect(request, "not-found"));
    if (player.steam_id_64 && player.steam_id_64 !== steamIdentity.external_id) {
      return NextResponse.redirect(profileRedirect(request, "identity-mismatch"));
    }

    const { error } = await supabase.rpc("link_verified_faceit_identity", {
      target_external_id: player.player_id,
      target_external_username: player.nickname,
      target_data_available: true,
    });

    return NextResponse.redirect(profileRedirect(request, error ? "error" : "linked"));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message.includes("FACEIT_DATA_API_KEY") ? "not-configured" : "error";
    return NextResponse.redirect(profileRedirect(request, status));
  }
}
