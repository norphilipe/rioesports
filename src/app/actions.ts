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
  const forwardedHost = headersList.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || headersList.get("host")?.split(",")[0]?.trim();
  const forwardedProto = headersList.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const protocol = forwardedProto === "http" || forwardedProto === "https" ? forwardedProto : host?.startsWith("localhost") ? "http" : "https";

  if (host) return `${protocol}://${host}`;
  return process.env.NODE_ENV === "production" ? "https://rioesports.com.br" : "http://localhost:3000";
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

export async function updateProfileAction(_: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const username = normalizeUsername(value(formData, "username"));
  const displayName = value(formData, "display_name");
  const city = value(formData, "city");

  if (!validateUsername(username).ok) return { error: "Nome de usuário inválido." };
  if (displayName.length < 2 || displayName.length > 60) return { error: "O nome de exibição deve ter entre 2 e 60 caracteres." };

  const validCities = new Set([
    "Angra dos Reis","Aperibé","Araruama","Areal","Armação dos Búzios","Arraial do Cabo","Barra do Piraí","Barra Mansa","Belford Roxo","Bom Jardim","Bom Jesus do Itabapoana","Cabo Frio","Cachoeiras de Macacu","Cambuci","Campos dos Goytacazes","Cantagalo","Carapebus","Cardoso Moreira","Carmo","Casimiro de Abreu","Comendador Levy Gasparian","Conceição de Macabu","Cordeiro","Duas Barras","Duque de Caxias","Engenheiro Paulo de Frontin","Guapimirim","Iguaba Grande","Itaboraí","Itaguaí","Italva","Itaocara","Itaperuna","Itatiaia","Japeri","Laje do Muriaé","Macaé","Macuco","Magé","Mangaratiba","Maricá","Mendes","Mesquita","Miguel Pereira","Miracema","Natividade","Nilópolis","Niterói","Nova Friburgo","Nova Iguaçu","Paracambi","Paraíba do Sul","Paraty","Paty do Alferes","Petrópolis","Pinheiral","Piraí","Porciúncula","Porto Real","Quatis","Queimados","Quissamã","Resende","Rio Bonito","Rio Claro","Rio das Flores","Rio das Ostras","Rio de Janeiro","Santa Maria Madalena","Santo Antônio de Pádua","São Fidélis","São Francisco de Itabapoana","São Gonçalo","São João da Barra","São João de Meriti","São José de Ubá","São José do Vale do Rio Preto","São Pedro da Aldeia","São Sebastião do Alto","Sapucaia","Saquarema","Seropédica","Silva Jardim","Sumidouro","Tanguá","Teresópolis","Trajano de Moraes","Três Rios","Valença","Varre-Sai","Vassouras","Volta Redonda"
  ]);

  const normalizedCity = city === "NA" ? "N/A" : city;
  if (normalizedCity !== "N/A" && !validCities.has(normalizedCity)) return { error: "Selecione um município válido do estado do Rio de Janeiro ou N/A." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sua sessão expirou." };

  const { data: existing } = await supabase.from("profiles").select("id").eq("username", username).neq("id", user.id).maybeSingle();
  if (existing) return { error: "Esse nome de usuário já está em uso." };

  const { error } = await supabase.from("profiles").update({
    username,
    display_name: displayName,
    city: normalizedCity,
    state_code: normalizedCity === "N/A" ? null : "RJ",
  }).eq("id", user.id);

  if (error) return { error: "Não foi possível salvar seu perfil." };
  redirect("/perfil?profile=saved");
}
