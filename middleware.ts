import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getPublicSupabaseRuntimeEnv } from "@/lib/env/public-runtime";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  let supabaseUrl: string;
  let supabasePublishableKey: string;
  try {
    ({ supabaseUrl, supabasePublishableKey } = await getPublicSupabaseRuntimeEnv());
  } catch (error) {
    console.error("Supabase middleware environment is unavailable", error);
    return new NextResponse("Service temporarily unavailable", { status: 503 });
  }

  const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user && request.nextUrl.pathname.startsWith("/perfil")) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      redirectUrl.searchParams.set("next", request.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }
  } catch (error) {
    console.error("Supabase middleware session validation failed", error);
    return new NextResponse("Service temporarily unavailable", { status: 503 });
  }

  return response;
}

export const config = {
  matcher: ["/perfil/:path*"],
};
