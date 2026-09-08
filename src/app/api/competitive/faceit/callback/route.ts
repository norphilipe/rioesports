import { NextResponse } from "next/server";

export async function GET(request: Request) {
  return NextResponse.redirect(new URL(`/api/auth/faceit/callback${new URL(request.url).search}`, request.url), 307);
}
