"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RIO_DE_JANEIRO_CITY_SET } from "@/lib/locations/rio-de-janeiro";
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

export async function updateProfileAction(formData: FormData) {
  const username = normalizeUsername(value(formData, "username"));
  const displayName = value(formData, "display_name");
  const city = value(formData, "city");
  const stateCode = "RJ";

  const usernameResult = validateUsername(username);
  if (!usernameResult.ok) redirect(`/perfil?profile=error&message=${encodeURIComponent(usernameResult.error ?? "Usuário inválido.")}`);
  if (!displayName || displayName.length > 80) redirect(`/perfil?profile=error&message=${encodeURIComponent("O nome de exibição deve ter entre 1 e 80 caracteres.")}`);
  if (city && !RIO_DE_JANEIRO_CITY_SET.has(city)) {
    redirect(`/perfil?profile=error&message=${encodeURIComponent("Selecione uma cidade válida do estado do Rio de Janeiro.")}`);
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("profiles")
    .update({
      username,
      display_name: displayName,
      city: city || null,
      state_code: city ? stateCode : null,
    })
    .eq("id", user.id);

  if (error) redirect(`/perfil?profile=error&message=${encodeURIComponent(error.message)}`);
  redirect("/perfil?profile=updated");
}

export async function linkOptionalIdentityAction(formData: FormData) {
  const provider = value(formData, "provider").toLowerCase();
  const externalUsername = value(formData, "external_username");

  if (provider !== "faceit" && provider !== "leetify") redirect("/perfil?identity=error");
  if (!externalUsername || externalUsername.length > 255) {
    redirect(`/perfil?identity=error&message=${encodeURIComponent("Informe um usuário ou URL de perfil válido.")}`);
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.rpc("link_optional_competitive_identity", {
    target_provider: provider,
    target_external_id: externalUsername,
    target_external_username: externalUsername,
  });

  if (error) redirect(`/perfil?identity=error&message=${encodeURIComponent(error.message)}`);
  redirect(`/perfil?identity=linked&provider=${encodeURIComponent(provider)}`);
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
