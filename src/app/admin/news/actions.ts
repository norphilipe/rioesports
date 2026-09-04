"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function slugify(input: string) {
  return input.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 100);
}

export async function createNewsAction(formData: FormData) {
  const title = value(formData, "title");
  const excerpt = value(formData, "excerpt") || null;
  const content = value(formData, "content");
  const coverImageUrl = value(formData, "cover_image_url") || null;
  const status = value(formData, "status") || "draft";
  const scheduledAtRaw = value(formData, "scheduled_at");

  if (!title || !content) redirect("/admin/news?error=Preencha+o+título+e+o+conteúdo.");
  if (!["draft", "published", "scheduled"].includes(status)) redirect("/admin/news?error=Status+inválido.");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: isAdmin } = await supabase.rpc("is_current_platform_admin");
  if (!isAdmin) redirect("/");

  const baseSlug = slugify(title);
  if (!baseSlug) redirect("/admin/news?error=Não+foi+possível+gerar+uma+URL+válida.");

  let slug = baseSlug;
  for (let suffix = 2; suffix < 100; suffix += 1) {
    const { data: existing } = await supabase.from("news_posts").select("id").eq("slug", slug).maybeSingle();
    if (!existing) break;
    slug = `${baseSlug}-${suffix}`;
  }

  const now = new Date().toISOString();
  const scheduledAt = scheduledAtRaw ? new Date(scheduledAtRaw).toISOString() : null;
  if (status === "scheduled" && !scheduledAt) redirect("/admin/news?error=Informe+a+data+da+publicação+agendada.");

  const { error } = await supabase.from("news_posts").insert({
    title,
    slug,
    excerpt,
    content,
    cover_image_url: coverImageUrl,
    status,
    published_at: status === "published" ? now : null,
    scheduled_at: status === "scheduled" ? scheduledAt : null,
    author_id: user.id,
  });

  if (error) redirect(`/admin/news?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/admin");
  revalidatePath("/admin/news");
  revalidatePath("/noticias");
  redirect("/admin/news?success=Notícia+salva+com+sucesso.");
}
