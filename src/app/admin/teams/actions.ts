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

export async function updateTeamStatusAction(formData: FormData) {
  const teamId = String(formData.get("teamId") ?? "");
  const action = String(formData.get("action") ?? "");
  if (!teamId || !["archive", "restore"].includes(action)) redirect("/admin/teams?error=Dados+inválidos.");

  const supabase = await requireAdmin();
  const { error } = await supabase.from("teams").update({ is_active: action === "restore" }).eq("id", teamId);
  if (error) redirect(`/admin/teams?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/admin/teams");
  revalidatePath("/equipes");
  redirect(`/admin/teams?success=Equipe+${action === "archive" ? "arquivada" : "restaurada"}+com+sucesso.`);
}
