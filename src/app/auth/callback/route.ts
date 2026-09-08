import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getPublicSupabaseEnv } from "@/lib/env";

function safeNext(value: string | null) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/perfil";
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeNext(url.searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=link_invalido", url.origin));
  }

  try {
    const { supabaseUrl, supabasePublishableKey } = await getPublicSupabaseEnv();
    const response = NextResponse.redirect(new URL(next, url.origin));
    const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
      cookies: {
        getAll() {
          return request.headers.get("cookie")?.split(/;\s*/).filter(Boolean).map((entry) => {
            const index = entry.indexOf("=");
            return { name: entry.slice(0, index), value: entry.slice(index + 1) };
          }) ?? [];
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    });

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return NextResponse.redirect(new URL("/login?error=link_invalido", url.origin));
    return response;
  } catch (error) {
    console.error("Supabase auth callback failed", error);
    return NextResponse.redirect(new URL("/login?error=servico_indisponivel", url.origin));
  }
}
