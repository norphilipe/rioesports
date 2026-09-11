import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.redirect("https://leetify.com/");
}
