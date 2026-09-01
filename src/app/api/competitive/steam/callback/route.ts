import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const STEAM_OPENID_ENDPOINT = "https://steamcommunity.com/openid/login";

function profileRedirect(request: Request, status: "linked" | "error") {
  const url = new URL("/perfil", request.url);
  url.searchParams.set("steam", status);
  return url;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const expectedState = request.headers
    .get("cookie")
    ?.match(/(?:^|; )rio_steam_link_state=([^;]+)/)?.[1];
  const receivedState = url.searchParams.get("state");

  if (!expectedState || !receivedState || expectedState !== receivedState) {
    return NextResponse.redirect(profileRedirect(request, "error"));
  }

  const claimedId = url.searchParams.get("openid.claimed_id");
  const steamIdMatch = claimedId?.match(/^https:\/\/steamcommunity\.com\/openid\/id\/([0-9]{17})$/);

  if (!steamIdMatch) {
    return NextResponse.redirect(profileRedirect(request, "error"));
  }

  const verificationParams = new URLSearchParams();
  for (const [key, value] of url.searchParams.entries()) {
    if (key.startsWith("openid.")) verificationParams.set(key, value);
  }
  verificationParams.set("openid.mode", "check_authentication");

  let valid = false;
  try {
    const verificationResponse = await fetch(STEAM_OPENID_ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: verificationParams.toString(),
      cache: "no-store",
    });
    const verificationBody = await verificationResponse.text();
    valid = verificationResponse.ok && /is_valid\s*:\s*true/i.test(verificationBody);
  } catch {
    valid = false;
  }

  if (!valid) {
    return NextResponse.redirect(profileRedirect(request, "error"));
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const { error } = await supabase.rpc("link_verified_steam_identity", {
    target_external_id: steamIdMatch[1],
    target_external_username: null,
  });

  const response = NextResponse.redirect(profileRedirect(request, error ? "error" : "linked"));
  response.cookies.set("rio_steam_link_state", "", {
    httpOnly: true,
    path: "/api/competitive/steam",
    maxAge: 0,
  });
  return response;
}
