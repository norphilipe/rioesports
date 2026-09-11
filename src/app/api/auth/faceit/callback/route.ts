import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getFaceitCallbackConfig } from "@/lib/env/faceit";

const TOKEN_ENDPOINT = "https://api.faceit.com/auth/v1/oauth/token";
const USERINFO_ENDPOINT = "https://api.faceit.com/auth/v1/resources/userinfo";
const STATE_COOKIE = "rio_faceit_oauth_state";
const VERIFIER_COOKIE = "rio_faceit_oauth_verifier";
const AUTH_COOKIE_DOMAIN = "rioesports.com.br";

type FaceitTokenResponse = { access_token?: string };
type FaceitUserInfo = { sub?: string; nickname?: string };

function profileRedirect(request: Request, status: string) {
  const url = new URL("/perfil", request.url);
  url.searchParams.set("faceit", status);
  return url;
}

function clearOAuthCookies(response: NextResponse) {
  for (const name of [STATE_COOKIE, VERIFIER_COOKIE]) {
    response.cookies.set(name, "", {
      domain: AUTH_COOKIE_DOMAIN,
      httpOnly: true,
      path: "/api/auth/faceit",
      maxAge: 0,
    });
  }
}

function basicAuthorization(clientId: string, clientSecret: string) {
  return `Basic ${btoa(`${clientId}:${clientSecret}`)}`;
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

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) throw new Error(`Supabase authentication check failed: ${userError.message}`);
    if (!user) {
      const response = NextResponse.redirect(new URL("/login", request.url));
      clearOAuthCookies(response);
      return response;
    }

    const { clientId, clientSecret, redirectUri } = await getFaceitCallbackConfig();
    const tokenRequest = new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: redirectUri, code_verifier: codeVerifier });
    const tokenResponse = await fetch(TOKEN_ENDPOINT, {
      method: "POST",
      headers: { authorization: basicAuthorization(clientId, clientSecret), "content-type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body: tokenRequest.toString(),
      cache: "no-store",
    });
    if (!tokenResponse.ok) throw new Error(`FACEIT token exchange failed with status ${tokenResponse.status}.`);
    const token = await tokenResponse.json() as FaceitTokenResponse;
    if (!token.access_token) throw new Error("FACEIT token response did not include an access token.");

    const userInfoResponse = await fetch(USERINFO_ENDPOINT, { headers: { authorization: `Bearer ${token.access_token}` }, cache: "no-store" });
    if (!userInfoResponse.ok) throw new Error(`FACEIT user information request failed with status ${userInfoResponse.status}.`);
    const faceitUser = await userInfoResponse.json() as FaceitUserInfo;
    if (!faceitUser.sub) throw new Error("FACEIT user information did not include a subject identifier.");

    const { error } = await supabase.rpc("link_verified_faceit_identity", {
      target_external_id: faceitUser.sub,
      target_external_username: faceitUser.nickname ?? null,
    });
    const response = NextResponse.redirect(profileRedirect(request, error ? "error" : "linked"));
    clearOAuthCookies(response);
    return response;
  } catch (error) {
    console.error("FACEIT OAuth callback failed", error);
    const response = NextResponse.redirect(profileRedirect(request, "error"));
    clearOAuthCookies(response);
    return response;
  }
}
