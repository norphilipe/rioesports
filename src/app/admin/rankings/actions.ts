"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: isAdmin } = await supabase.rpc("is_current_platform_admin");
  if (!isAdmin) redirect("/");
  return supabase;
}

export async function createSeasonAction(formData: FormData) {
  const gameId = String(formData.get("game_id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const startsAt = String(formData.get("starts_at") ?? "");
  const endsAtRaw = String(formData.get("ends_at") ?? "");
  const activateNow = String(formData.get("activate_now") ?? "") === "on";

  if (!gameId || !name || !startsAt) redirect("/admin/rankings?error=Preencha+os+campos+obrigatórios.");

  const supabase = await requireAdmin();
  const { error } = await supabase.rpc("admin_create_game_season", {
    target_game_id: gameId,
    season_name: name,
    starts_at_value: new Date(startsAt).toISOString(),
    ends_at_value: endsAtRaw ? new Date(endsAtRaw).toISOString() : null,
    activate_now: activateNow,
  });

  if (error) redirect(`/admin/rankings?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/admin/rankings");
  redirect("/admin/rankings?success=Temporada+criada+com+sucesso.");
}

export async function setSeasonStatusAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const active = String(formData.get("active") ?? "") === "true";
  if (!id) redirect("/admin/rankings?error=Temporada+inválida.");

  const supabase = await requireAdmin();
  const { error } = await supabase.rpc("admin_set_game_season_active", {
    target_season_id: id,
    active_value: active,
  });

  if (error) redirect(`/admin/rankings?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/admin/rankings");
  redirect("/admin/rankings?success=Status+da+temporada+atualizado.");
}
