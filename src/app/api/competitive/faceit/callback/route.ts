import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const TOKEN_ENDPOINT = "https://api.faceit.com/auth/v1/oauth/token";
const USERINFO_ENDPOINT = "https://api.faceit.com/auth/v1/resources/userinfo";

function readCookie(request: Request, name: string) {
  return request.headers.get("cookie")?.match(new RegExp(`(?:^|; )${name}=([^;]+)`))?.[1];
}

function redirectToProfile(request: Request, status: string) {
  const url = new URL("/perfil", request.url);
  url.searchParams.set("faceit", status);
  return NextResponse.redirect(url);
}

function clearCookies(response: NextResponse) {
  for (const name of ["rio_faceit_link_state", "rio_faceit_link_verifier"]) {
    response.cookies.set(name, "", { httpOnly: true, path: "/api/competitive/faceit", maxAge: 0 });
  }
  return response;
}

export async function GET(request: Request) {
  const clientId = process.env.FACEIT_CLIENT_ID;
  const clientSecret = process.env.FACEIT_CLIENT_SECRET;
  const url = new URL(request.url);
  const expectedState = readCookie(request, "rio_faceit_link_state");
  const verifier = readCookie(request, "rio_faceit_link_verifier");
  const state = url.searchParams.get("state");
  const code = url.searchParams.get("code");

  if (!clientId || !clientSecret || !expectedState || !verifier || !state || state !== expectedState || !code) {
    return clearCookies(redirectToProfile(request, "error"));
  }

  const redirectUri = new URL("/api/competitive/faceit/callback", request.url).toString();
  let accessToken: string | null = null;
  try {
    const tokenResponse = await fetch(TOKEN_ENDPOINT, {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
      body: new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: redirectUri, code_verifier: verifier }).toString(),
      cache: "no-store",
    });
    if (!tokenResponse.ok) throw new Error("FACEIT token exchange failed");
    const tokenPayload = await tokenResponse.json() as { access_token?: string };
    accessToken = tokenPayload.access_token ?? null;
  } catch {
    return clearCookies(redirectToProfile(request, "error"));
  }

  if (!accessToken) return clearCookies(redirectToProfile(request, "error"));

  try {
    const userinfoResponse = await fetch(USERINFO_ENDPOINT, { headers: { authorization: `Bearer ${accessToken}` }, cache: "no-store" });
    if (!userinfoResponse.ok) throw new Error("FACEIT userinfo request failed");
    const identity = await userinfoResponse.json() as { sub?: string; nickname?: string; name?: string; preferred_username?: string };
    if (!identity.sub) throw new Error("FACEIT user identity missing");

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return clearCookies(NextResponse.redirect(new URL("/login", request.url)));

    const { error } = await supabase.rpc("link_verified_faceit_identity", {
      target_external_id: identity.sub,
      target_external_username: identity.nickname ?? identity.preferred_username ?? identity.name ?? null,
    });
    return clearCookies(redirectToProfile(request, error ? "error" : "linked"));
  } catch {
    return clearCookies(redirectToProfile(request, "error"));
  }
}
