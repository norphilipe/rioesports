import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getServerSupabaseEnv } from "@/lib/env/server";

const AUTH_COOKIE_DOMAIN = "rioesports.com.br";

export async function createClient() {
  const cookieStore = await cookies();
  const { supabaseUrl, supabasePublishableKey } = await getServerSupabaseEnv();

  return createServerClient(supabaseUrl, supabasePublishableKey, {
    cookieOptions: {
      domain: AUTH_COOKIE_DOMAIN,
    },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, { ...options, domain: AUTH_COOKIE_DOMAIN }),
          );
        } catch {
          // Server Components podem não permitir escrita de cookies.
        }
      },
    },
  });
}
