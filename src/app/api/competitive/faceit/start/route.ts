import { createHash, randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const AUTHORIZATION_ENDPOINT = "https://accounts.faceit.com";

function base64Url(buffer: Buffer) {
  return buffer.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export async function GET(request: Request) {
  const clientId = process.env.FACEIT_CLIENT_ID;
  if (!clientId) return NextResponse.redirect(new URL("/perfil?faceit=unconfigured", request.url));

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url));

  const callbackUrl = new URL("/api/competitive/faceit/callback", request.url);
  const state = randomBytes(24).toString("hex");
  const verifier = base64Url(randomBytes(48));
  const challenge = base64Url(createHash("sha256").update(verifier).digest());

  const authorizationUrl = new URL(AUTHORIZATION_ENDPOINT);
  authorizationUrl.searchParams.set("response_type", "code");
  authorizationUrl.searchParams.set("client_id", clientId);
  authorizationUrl.searchParams.set("redirect_uri", callbackUrl.toString());
  authorizationUrl.searchParams.set("scope", "openid profile");
  authorizationUrl.searchParams.set("state", state);
  authorizationUrl.searchParams.set("code_challenge", challenge);
  authorizationUrl.searchParams.set("code_challenge_method", "S256");

  const response = NextResponse.redirect(authorizationUrl);
  const secure = new URL(request.url).protocol === "https:";
  const cookieOptions = { httpOnly: true, secure, sameSite: "lax" as const, path: "/api/competitive/faceit", maxAge: 10 * 60 };
  response.cookies.set("rio_faceit_link_state", state, cookieOptions);
  response.cookies.set("rio_faceit_link_verifier", verifier, cookieOptions);
  return response;
}
