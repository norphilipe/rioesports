import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "edge";

const FACEIT_AUTHORIZATION_ENDPOINT = "https://accounts.faceit.com";
const STATE_COOKIE = "rio_faceit_oauth_state";
const VERIFIER_COOKIE = "rio_faceit_oauth_verifier";

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

function getFaceitConfig() {
  const clientId = process.env.FACEIT_OAUTH_CLIENT_ID;
  const redirectUri = process.env.FACEIT_OAUTH_REDIRECT_URI;
  if (!clientId || !redirectUri) throw new Error("FACEIT OAuth is not configured.");
  return { clientId, redirectUri };
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url));

  try {
    const { clientId, redirectUri } = getFaceitConfig();
    const state = randomBase64Url(32);
    const codeVerifier = randomBase64Url(64);
    const codeChallenge = await sha256Base64Url(codeVerifier);

    const authorizationUrl = new URL(FACEIT_AUTHORIZATION_ENDPOINT);
    authorizationUrl.searchParams.set("response_type", "code");
    authorizationUrl.searchParams.set("client_id", clientId);
    authorizationUrl.searchParams.set("redirect_uri", redirectUri);
    authorizationUrl.searchParams.set("scope", "openid email membership profile");
    authorizationUrl.searchParams.set("state", state);
    authorizationUrl.searchParams.set("code_challenge", codeChallenge);
    authorizationUrl.searchParams.set("code_challenge_method", "S256");

    const response = NextResponse.redirect(authorizationUrl);
    const cookieOptions = {
      httpOnly: true,
      secure: new URL(request.url).protocol === "https:",
      sameSite: "lax" as const,
      path: "/api/auth/faceit",
      maxAge: 10 * 60,
    };
    response.cookies.set(STATE_COOKIE, state, cookieOptions);
    response.cookies.set(VERIFIER_COOKIE, codeVerifier, cookieOptions);
    return response;
  } catch {
    const url = new URL("/perfil", request.url);
    url.searchParams.set("faceit", "configuration_error");
    return NextResponse.redirect(url);
  }
}
