import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getServerSupabaseEnv } from "@/lib/env/server";

export async function createClient() {
  const cookieStore = await cookies();
  const { supabaseUrl, supabasePublishableKey } = await getServerSupabaseEnv();

  return createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Server Components podem não permitir escrita de cookies.
        }
      },
    },
  });
}
