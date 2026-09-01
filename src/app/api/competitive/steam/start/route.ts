import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const STEAM_OPENID_ENDPOINT = "https://steamcommunity.com/openid/login";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const callbackUrl = new URL("/api/competitive/steam/callback", request.url);
  const nonce = randomBytes(24).toString("hex");
  callbackUrl.searchParams.set("state", nonce);

  const openIdUrl = new URL(STEAM_OPENID_ENDPOINT);
  openIdUrl.searchParams.set("openid.ns", "http://specs.openid.net/auth/2.0");
  openIdUrl.searchParams.set("openid.mode", "checkid_setup");
  openIdUrl.searchParams.set("openid.return_to", callbackUrl.toString());
  openIdUrl.searchParams.set("openid.realm", new URL(request.url).origin);
  openIdUrl.searchParams.set("openid.identity", "http://specs.openid.net/auth/2.0/identifier_select");
  openIdUrl.searchParams.set("openid.claimed_id", "http://specs.openid.net/auth/2.0/identifier_select");

  const response = NextResponse.redirect(openIdUrl);
  response.cookies.set("rio_steam_link_state", nonce, {
    httpOnly: true,
    secure: new URL(request.url).protocol === "https:",
    sameSite: "lax",
    path: "/api/competitive/steam",
    maxAge: 10 * 60,
  });

  return response;
}
