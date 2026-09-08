"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function toSlug(value: string) { return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 80) || `noticia-${Date.now()}`; }
async function requireAdmin() { const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect("/login"); const { data: isAdmin } = await supabase.rpc("is_current_platform_admin"); if (!isAdmin) redirect("/"); return { supabase, user }; }

export async function createNewsAction(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim(), excerpt = String(formData.get("excerpt") ?? "").trim(), content = String(formData.get("content") ?? "").trim(), status = String(formData.get("status") ?? "draft");
  if (!title || !content || !["draft", "published"].includes(status)) redirect("/admin/news?error=Preencha+os+campos+obrigatórios.");
  const { supabase, user } = await requireAdmin(); const slug = `${toSlug(title)}-${Date.now().toString().slice(-5)}`;
  const { error } = await supabase.from("platform_news").insert({ title, slug, excerpt: excerpt || null, content, published_at: status === "published" ? new Date().toISOString() : null, author_id: user.id });
  if (error) redirect(`/admin/news?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/admin/news"); revalidatePath("/noticias"); redirect("/admin/news?success=Notícia+salva+com+sucesso.");
}

export async function updateNewsStatusAction(formData: FormData) {
  const id = String(formData.get("id") ?? ""), status = String(formData.get("status") ?? "");
  if (!id || !["draft", "published"].includes(status)) redirect("/admin/news?error=Dados+inválidos.");
  const { supabase } = await requireAdmin(); const { data: post } = await supabase.from("platform_news").select("slug,published_at").eq("id", id).maybeSingle();
  if (!post) redirect("/admin/news?error=Notícia+não+encontrada.");
  const { error } = await supabase.from("platform_news").update({ published_at: status === "published" ? (post.published_at ?? new Date().toISOString()) : null }).eq("id", id);
  if (error) redirect(`/admin/news?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/admin/news"); revalidatePath("/noticias"); if (post.slug) revalidatePath(`/noticias/${post.slug}`); redirect("/admin/news?success=Status+atualizado+com+sucesso.");
}
