"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createModerationAction(formData: FormData) {
  const targetProfileId = String(formData.get("targetProfileId") ?? "");
  const actionType = String(formData.get("actionType") ?? "");
  const reason = String(formData.get("reason") ?? "");
  const expiresAtRaw = String(formData.get("expiresAt") ?? "");
  if (!targetProfileId || !actionType) throw new Error("target and action are required");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("authentication required");
  const expiresAt = expiresAtRaw ? new Date(expiresAtRaw).toISOString() : null;
  const { error } = await supabase.rpc("create_platform_moderation_action", { p_target_profile_id: targetProfileId, p_action_type: actionType, p_reason: reason || null, p_expires_at: expiresAt });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/moderation");
}
