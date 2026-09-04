"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createNewsAction(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const status = String(formData.get("status") ?? "draft");
  if (!title || !content || !["draft","published"].includes(status)) redirect("/admin/news?error=Preencha+os+campos+obrigatórios.");
  const slug = title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 80) || `noticia-${Date.now()}`;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: isAdmin } = await supabase.rpc("is_current_platform_admin");
  if (!isAdmin) redirect("/");
  const { error } = await supabase.from("news_posts").insert({ title, slug: `${slug}-${Date.now().toString().slice(-5)}`, excerpt: excerpt || null, content, status, published_at: status === "published" ? new Date().toISOString() : null, author_id: user.id });
  if (error) redirect(`/admin/news?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/admin/news"); revalidatePath("/noticias"); redirect("/admin/news?success=Notícia+salva+com+sucesso.");
}
