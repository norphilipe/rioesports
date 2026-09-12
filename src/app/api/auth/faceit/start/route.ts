import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getFaceitStartConfig } from "@/lib/env/faceit";

const FACEIT_AUTHORIZATION_ENDPOINT = "https://accounts.faceit.com";
const STATE_COOKIE = "rio_faceit_oauth_state_v2";
const VERIFIER_COOKIE = "rio_faceit_oauth_verifier_v2";
const AUTH_COOKIE_DOMAIN = "rioesports.com.br";

function base64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function randomBase64Url(byteLength: number) {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return base64Url(bytes);
}

async function sha256Base64Url(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return base64Url(new Uint8Array(digest));
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      throw new Error(`Supabase authentication check failed: ${userError.message}`);
    }

    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const { clientId, redirectUri } = await getFaceitStartConfig();
    const state = randomBase64Url(32);
    const codeVerifier = randomBase64Url(64);
    const codeChallenge = await sha256Base64Url(codeVerifier);

    const authorizationUrl = new URL(FACEIT_AUTHORIZATION_ENDPOINT);
    authorizationUrl.searchParams.set("response_type", "code");
    authorizationUrl.searchParams.set("client_id", clientId);
    authorizationUrl.searchParams.set("redirect_uri", redirectUri);
    authorizationUrl.searchParams.set("scope", "openid");
    authorizationUrl.searchParams.set("state", state);
    authorizationUrl.searchParams.set("code_challenge", codeChallenge);
    authorizationUrl.searchParams.set("code_challenge_method", "S256");

    const response = NextResponse.redirect(authorizationUrl);
    const cookieOptions = {
      domain: AUTH_COOKIE_DOMAIN,
      httpOnly: true,
      secure: new URL(request.url).protocol === "https:",
      sameSite: "lax" as const,
      path: "/api/auth/faceit",
      maxAge: 10 * 60,
    };

    response.cookies.set(STATE_COOKIE, state, cookieOptions);
    response.cookies.set(VERIFIER_COOKIE, codeVerifier, cookieOptions);

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown initialization error.";
    console.error("FACEIT OAuth start failed", error);

    return NextResponse.json(
      {
        error: "FACEIT OAuth start failed",
        reason: message,
      },
      { status: 500 },
    );
  }
}
