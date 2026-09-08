"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: isAdmin } = await supabase.rpc("is_current_platform_admin");
  if (!isAdmin) redirect("/");
  return supabase;
}

export async function createModerationAction(formData: FormData) {
  const targetProfileId = String(formData.get("targetProfileId") ?? "");
  const actionType = String(formData.get("actionType") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  const expiresAtRaw = String(formData.get("expiresAt") ?? "");
  if (!targetProfileId || !actionType) redirect("/admin/moderation?error=Selecione+um+usuário+e+uma+ação.");

  let expiresAt: string | null = null;
  if (expiresAtRaw) {
    const parsed = new Date(expiresAtRaw);
    if (Number.isNaN(parsed.getTime())) redirect("/admin/moderation?error=Data+de+expiração+inválida.");
    expiresAt = parsed.toISOString();
  }

  const supabase = await requireAdmin();
  const { error } = await supabase.rpc("create_platform_moderation_action", {
    p_target_profile_id: targetProfileId,
    p_action_type: actionType,
    p_reason: reason || null,
    p_expires_at: expiresAt,
  });
  if (error) redirect(`/admin/moderation?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/admin/moderation");
  redirect("/admin/moderation?success=Ação+disciplinar+registrada+com+sucesso.");
}
