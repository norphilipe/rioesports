"use server";

import { headers } from "next/headers";
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
