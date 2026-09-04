"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const allowedTypes = new Set(["warning", "suspension", "ban"]);

export async function createPenaltyAction(formData: FormData) {
  const userId = String(formData.get("user_id") ?? "");
  const penaltyType = String(formData.get("penalty_type") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  const expiresRaw = String(formData.get("expires_at") ?? "").trim();
  if (!userId || !allowedTypes.has(penaltyType) || reason.length < 3) redirect("/admin/moderation?error=Dados+de+moderação+inválidos.");
  const expiresAt = expiresRaw ? new Date(expiresRaw).toISOString() : null;
  if (expiresRaw && Number.isNaN(new Date(expiresRaw).getTime())) redirect("/admin/moderation?error=Data+de+expiração+inválida.");
  if (penaltyType === "suspension" && !expiresAt) redirect("/admin/moderation?error=Suspensões+precisam+de+uma+data+de+expiração.");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: isAdmin } = await supabase.rpc("is_current_platform_admin");
  if (!isAdmin) redirect("/");

  const { error } = await supabase.from("user_penalties").insert({ user_id: userId, moderator_id: user.id, penalty_type: penaltyType, reason, expires_at: expiresAt });
  if (error) redirect(`/admin/moderation?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/admin");
  revalidatePath("/admin/moderation");
  redirect("/admin/moderation?success=Penalidade+registrada+com+sucesso.");
}

export async function revokePenaltyAction(formData: FormData) {
  const penaltyId = String(formData.get("penalty_id") ?? "");
  const revokeReason = String(formData.get("revoke_reason") ?? "Revogada por administrador").trim();
  if (!penaltyId) redirect("/admin/moderation?error=Penalidade+inválida.");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: isAdmin } = await supabase.rpc("is_current_platform_admin");
  if (!isAdmin) redirect("/");
  const { error } = await supabase.from("user_penalties").update({ revoked_at: new Date().toISOString(), revoked_by: user.id, revoke_reason: revokeReason }).eq("id", penaltyId).is("revoked_at", null);
  if (error) redirect(`/admin/moderation?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/admin/moderation");
  redirect("/admin/moderation?success=Penalidade+revogada.");
}
