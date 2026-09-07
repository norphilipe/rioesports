import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    return user;
  } catch (error) {
    // Keep public pages available while the Cloudflare runtime integration
    // is being diagnosed. Authentication-dependent routes still use
    // requireUser(), which redirects unauthenticated visitors to /login.
    console.error("Failed to initialize Supabase authentication:", error);
    return null;
  }
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
