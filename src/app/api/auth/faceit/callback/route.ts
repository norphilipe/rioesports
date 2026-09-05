import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const TOKEN_ENDPOINT = "https://api.faceit.com/auth/v1/oauth/token";
const USERINFO_ENDPOINT = "https://api.faceit.com/auth/v1/resources/userinfo";
const STATE_COOKIE = "rio_faceit_oauth_state";
const VERIFIER_COOKIE = "rio_faceit_oauth_verifier";

type FaceitTokenResponse = { access_token?: string };
type FaceitUserInfo = { sub?: string; nickname?: string };

function profileRedirect(request: Request, status: string) {
  const url = new URL("/perfil", request.url);
  url.searchParams.set("faceit", status);
  return url;
}

function clearOAuthCookies(response: NextResponse) {
  for (const name of [STATE_COOKIE, VERIFIER_COOKIE]) {
    response.cookies.set(name, "", { httpOnly: true, path: "/api/auth/faceit", maxAge: 0 });
  }
}

function getFaceitConfig() {
  const clientId = process.env.FACEIT_OAUTH_CLIENT_ID;
  const clientSecret = process.env.FACEIT_OAUTH_CLIENT_SECRET;
  const redirectUri = process.env.FACEIT_OAUTH_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("FACEIT OAuth credentials are not configured.");
  }
  return { clientId, clientSecret, redirectUri };
}

export async function GET(request: NextRequest) {
  const providerError = request.nextUrl.searchParams.get("error");
  const code = request.nextUrl.searchParams.get("code");
  const receivedState = request.nextUrl.searchParams.get("state");
  const expectedState = request.cookies.get(STATE_COOKIE)?.value;
  const codeVerifier = request.cookies.get(VERIFIER_COOKIE)?.value;

  if (providerError || !code || !receivedState || !expectedState || !codeVerifier || receivedState !== expectedState) {
    const response = NextResponse.redirect(profileRedirect(request, "error"));
    clearOAuthCookies(response);
    return response;
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    clearOAuthCookies(response);
    return response;
  }

  try {
    const { clientId, clientSecret, redirectUri } = getFaceitConfig();
    const tokenRequest = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    });
    const basicCredentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const tokenResponse = await fetch(TOKEN_ENDPOINT, {
      method: "POST",
      headers: {
        authorization: `Basic ${basicCredentials}`,
        "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
      body: tokenRequest.toString(),
      cache: "no-store",
    });

    if (!tokenResponse.ok) throw new Error("FACEIT token exchange failed.");
    const token = await tokenResponse.json() as FaceitTokenResponse;
    if (!token.access_token) throw new Error("FACEIT token response did not include an access token.");

    const userInfoResponse = await fetch(USERINFO_ENDPOINT, {
      headers: { authorization: `Bearer ${token.access_token}` },
      cache: "no-store",
    });
    if (!userInfoResponse.ok) throw new Error("FACEIT user information request failed.");

    const faceitUser = await userInfoResponse.json() as FaceitUserInfo;
    if (!faceitUser.sub) throw new Error("FACEIT user information did not include a subject identifier.");

    const { error } = await supabase.rpc("link_verified_faceit_identity", {
      target_external_id: faceitUser.sub,
      target_external_username: faceitUser.nickname ?? null,
    });

    const response = NextResponse.redirect(profileRedirect(request, error ? "error" : "linked"));
    clearOAuthCookies(response);
    return response;
  } catch {
    const response = NextResponse.redirect(profileRedirect(request, "error"));
    clearOAuthCookies(response);
    return response;
  }
}
