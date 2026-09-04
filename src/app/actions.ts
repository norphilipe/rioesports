"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  normalizeUsername,
  validateEmail,
  validatePassword,
  validateUsername,
} from "@/lib/auth/validation";

export type AuthActionState = { error?: string; message?: string };

function value(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 150);
}

async function getOrigin() {
  const headersList = await headers();
  return headersList.get("origin") ?? "http://localhost:3000";
}

export async function signUpAction(_: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const email = value(formData, "email");
  const password = String(formData.get("password") ?? "");
  const username = normalizeUsername(value(formData, "username"));
  const displayName = value(formData, "display_name") || username;

  for (const result of [validateEmail(email), validatePassword(password), validateUsername(username)]) {
    if (!result.ok) return { error: result.error };
  }

  const supabase = await createClient();
  const origin = await getOrigin();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/perfil`,
      data: { username, display_name: displayName },
    },
  });

  if (error) return { error: error.message };
  redirect(`/confirmacao?email=${encodeURIComponent(email)}`);
}

export async function signInAction(_: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const email = value(formData, "email");
  const password = String(formData.get("password") ?? "");

  const emailResult = validateEmail(email);
  if (!emailResult.ok) return { error: emailResult.error };
  if (!password) return { error: "Informe sua senha." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "Não foi possível entrar. Verifique seus dados." };
  redirect("/perfil");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function requestPasswordResetAction(_: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const email = value(formData, "email");
  const emailResult = validateEmail(email);
  if (!emailResult.ok) return { error: emailResult.error };

  const supabase = await createClient();
  const origin = await getOrigin();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/redefinir-senha`,
  });

  if (error) return { error: error.message };
  return { message: "Se o e-mail estiver cadastrado, enviaremos um link para redefinir sua senha." };
}

export async function updatePasswordAction(_: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const password = String(formData.get("password") ?? "");
  const confirmation = String(formData.get("password_confirmation") ?? "");
  const passwordResult = validatePassword(password);
  if (!passwordResult.ok) return { error: passwordResult.error };
  if (password !== confirmation) return { error: "As senhas não coincidem." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Seu link de recuperação expirou ou é inválido." };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };
  redirect("/perfil");
}

export async function createNewsAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const title = value(formData, "title");
  const excerpt = value(formData, "excerpt");
  const content = value(formData, "content");
  const coverImageUrl = value(formData, "cover_image_url") || null;
  const status = value(formData, "status") || "draft";
  const customSlug = slugify(value(formData, "slug"));
  const slug = customSlug || slugify(title);

  if (title.length < 3) throw new Error("O título precisa ter pelo menos 3 caracteres.");
  if (!slug) throw new Error("Não foi possível gerar uma URL para esta notícia.");
  if (!excerpt) throw new Error("Informe um resumo para a notícia.");
  if (!content) throw new Error("Escreva o conteúdo da notícia.");
  if (!["draft", "published", "scheduled"].includes(status)) throw new Error("Status inválido.");

  const scheduledAt = value(formData, "published_at");
  const publishedAt = status === "published" ? new Date().toISOString() : status === "scheduled" && scheduledAt ? new Date(scheduledAt).toISOString() : null;
  if (status === "scheduled" && !publishedAt) throw new Error("Informe a data de publicação.");

  const { error } = await supabase.from("news_articles").insert({
    title,
    slug,
    excerpt,
    content,
    cover_image_url: coverImageUrl,
    status,
    author_id: user.id,
    published_at: publishedAt,
  });

  if (error) {
    if (error.code === "23505") throw new Error("Já existe uma notícia usando esta URL. Escolha outro slug.");
    throw new Error(error.message);
  }

  revalidatePath("/admin/noticias");
  revalidatePath("/noticias");
  redirect("/admin/noticias");
}
