import { NextRequest, NextResponse } from "next/server";

const CALLBACK_PATH = "/api/auth/faceit/callback";

/**
 * FACEIT OAuth callback entry point.
 *
 * The production URL registered in FACEIT App Studio must be:
 * https://rioesports.com.br/api/auth/faceit/callback
 *
 * This endpoint intentionally does not persist OAuth data yet. The next
 * integration step will exchange the authorization code using the FACEIT
 * OAuth client credentials and link the verified FACEIT identity to the
 * authenticated Rio Esports user.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const providerError = searchParams.get("error");
  const code = searchParams.get("code");

  if (providerError) {
    const redirectUrl = new URL("/perfil", request.url);
    redirectUrl.searchParams.set("faceit", "error");
    return NextResponse.redirect(redirectUrl);
  }

  if (!code) {
    return NextResponse.json(
      {
        error: "FACEIT OAuth callback is missing the authorization code.",
        callback: CALLBACK_PATH,
      },
      { status: 400 },
    );
  }

  return NextResponse.json(
    {
      status: "pending_integration",
      message:
        "FACEIT authorization was received. Identity linking will be completed after the OAuth client credentials and persistence flow are configured.",
    },
    { status: 501 },
  );
}
