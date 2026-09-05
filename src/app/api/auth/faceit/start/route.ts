import { createHash, randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const FACEIT_AUTHORIZATION_ENDPOINT = "https://accounts.faceit.com";
const STATE_COOKIE = "rio_faceit_oauth_state";
const VERIFIER_COOKIE = "rio_faceit_oauth_verifier";

function base64Url(value: Buffer) {
  return value.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function getFaceitConfig() {
  const clientId = process.env.FACEIT_OAUTH_CLIENT_ID;
  const redirectUri = process.env.FACEIT_OAUTH_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    throw new Error("FACEIT OAuth is not configured.");
  }

  return { clientId, redirectUri };
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const { clientId, redirectUri } = getFaceitConfig();
    const state = base64Url(randomBytes(32));
    const codeVerifier = base64Url(randomBytes(64));
    const codeChallenge = createHash("sha256").update(codeVerifier).digest("base64url");

    const authorizationUrl = new URL(FACEIT_AUTHORIZATION_ENDPOINT);
    authorizationUrl.searchParams.set("response_type", "code");
    authorizationUrl.searchParams.set("client_id", clientId);
    authorizationUrl.searchParams.set("redirect_uri", redirectUri);
    authorizationUrl.searchParams.set("scope", "openid email membership profile");
    authorizationUrl.searchParams.set("state", state);
    authorizationUrl.searchParams.set("code_challenge", codeChallenge);
    authorizationUrl.searchParams.set("code_challenge_method", "S256");

    const response = NextResponse.redirect(authorizationUrl);
    const secure = new URL(request.url).protocol === "https:";
    const cookieOptions = {
      httpOnly: true,
      secure,
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
