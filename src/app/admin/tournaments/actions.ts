"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const TOURNAMENT_STATUSES = ["draft", "registration", "checkin", "running", "finished", "cancelled"] as const;

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

function toIso(value: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: isAdmin, error } = await supabase.rpc("is_current_platform_admin");
  if (error || !isAdmin) redirect("/?error=acesso_restrito");
  return { supabase, user };
}

export async function createTournamentAction(formData: FormData) {
  const name = text(formData, "name");
  const gameId = text(formData, "game_id");
  const description = text(formData, "description") || null;
  const format = text(formData, "format");
  const status = text(formData, "status") || "draft";
  const bestOf = Number(text(formData, "best_of") || "1");
  const maxTeamsRaw = text(formData, "max_teams");
  const maxTeams = maxTeamsRaw ? Number(maxTeamsRaw) : null;
  const registrationStart = toIso(text(formData, "registration_start"));
  const registrationEnd = toIso(text(formData, "registration_end"));
  const startAt = toIso(text(formData, "start_at"));

  if (!name || !gameId) redirect("/admin/tournaments?error=Informe+o+nome+e+o+jogo+do+campeonato.");
  if (!["single_elimination", "double_elimination", "round_robin", "swiss", "groups_playoffs"].includes(format)) redirect("/admin/tournaments?error=Formato+de+campeonato+inválido.");
  if (!TOURNAMENT_STATUSES.includes(status as (typeof TOURNAMENT_STATUSES)[number])) redirect("/admin/tournaments?error=Status+do+campeonato+inválido.");
  if (![1, 3, 5].includes(bestOf) || (maxTeams !== null && (!Number.isInteger(maxTeams) || maxTeams <= 0))) redirect("/admin/tournaments?error=Revise+as+configurações+numéricas+do+campeonato.");

  const { supabase, user } = await requireAdmin();
  const baseSlug = slugify(name);
  if (!baseSlug) redirect("/admin/tournaments?error=Não+foi+possível+gerar+uma+URL+válida.");

  let slug = baseSlug;
  for (let attempt = 2; attempt < 100; attempt += 1) {
    const { data: existing } = await supabase.from("tournaments").select("id").eq("slug", slug).maybeSingle();
    if (!existing) break;
    slug = `${baseSlug}-${attempt}`;
  }

  const { error } = await supabase.from("tournaments").insert({
    game_id: gameId, created_by: user.id, name, slug, description, format, status,
    best_of: bestOf, max_teams: maxTeams, registration_start: registrationStart,
    registration_end: registrationEnd, start_at: startAt,
  });

  if (error) redirect(`/admin/tournaments?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/admin");
  revalidatePath("/admin/tournaments");
  revalidatePath("/campeonatos");
  redirect("/admin/tournaments?success=Campeonato+criado+com+sucesso.");
}

export async function updateTournamentStatusAction(formData: FormData) {
  const id = text(formData, "id");
  const status = text(formData, "status");
  if (!id || !TOURNAMENT_STATUSES.includes(status as (typeof TOURNAMENT_STATUSES)[number])) redirect("/admin/tournaments?error=Dados+do+campeonato+inválidos.");

  const { supabase } = await requireAdmin();
  const { data: tournament } = await supabase.from("tournaments").select("slug").eq("id", id).maybeSingle();
  if (!tournament) redirect("/admin/tournaments?error=Campeonato+não+encontrado.");

  const { error } = await supabase.from("tournaments").update({ status }).eq("id", id);
  if (error) redirect(`/admin/tournaments?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/admin");
  revalidatePath("/admin/tournaments");
  revalidatePath("/campeonatos");
  if (tournament.slug) revalidatePath(`/campeonatos/${tournament.slug}`);
  redirect("/admin/tournaments?success=Status+do+campeonato+atualizado.");
}
