"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { AuthActionState } from "@/app/actions";

type Mode = "login" | "signup" | "recover" | "reset";

type Props = {
  mode: Mode;
  action: (state: AuthActionState, formData: FormData) => Promise<AuthActionState>;
};

const initialState: AuthActionState = {};

export function AuthForm({ mode, action }: Props) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const title = {
    login: "Entrar na RIO ESPORTS",
    signup: "Criar sua conta",
    recover: "Recuperar senha",
    reset: "Criar nova senha",
  }[mode];

  return (
    <section className="mx-auto w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl sm:p-8">
      <h1 className="text-2xl font-black">{title}</h1>
      <p className="mt-2 text-sm leading-6 text-white/50">
        {mode === "login" && "Acesse sua conta e continue sua jornada competitiva."}
        {mode === "signup" && "Use seus dados reais de acesso. Você poderá completar seu perfil depois."}
        {mode === "recover" && "Enviaremos um link seguro para o seu e-mail."}
        {mode === "reset" && "Escolha uma nova senha para sua conta."}
      </p>

      <form action={formAction} className="mt-7 space-y-4">
        {mode === "signup" && (
          <>
            <Field label="Nome de usuário" name="username" autoComplete="username" />
            <Field label="Nome de exibição" name="display_name" autoComplete="name" />
          </>
        )}

        {(mode === "login" || mode === "signup" || mode === "recover") && (
          <Field label="E-mail" name="email" type="email" autoComplete="email" />
        )}

        {(mode === "login" || mode === "signup" || mode === "reset") && (
          <Field label="Senha" name="password" type="password" autoComplete={mode === "reset" ? "new-password" : mode === "signup" ? "new-password" : "current-password"} />
        )}

        {mode === "reset" && (
          <Field label="Confirmar senha" name="password_confirmation" type="password" autoComplete="new-password" />
        )}

        {state.error && <p role="alert" className="rounded-lg border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-200">{state.error}</p>}
        {state.message && <p className="rounded-lg border border-cyan-400/30 bg-cyan-400/10 p-3 text-sm text-cyan-100">{state.message}</p>}

        <button disabled={pending} className="w-full rounded-lg bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60">
          {pending ? "Aguarde..." : mode === "login" ? "ENTRAR" : mode === "signup" ? "CRIAR CONTA" : mode === "recover" ? "ENVIAR LINK" : "ATUALIZAR SENHA"}
        </button>
      </form>

      <div className="mt-6 space-y-2 text-center text-sm text-white/55">
        {mode === "login" && <><Link className="block hover:text-white" href="/recuperar-senha">Esqueci minha senha</Link><Link className="block hover:text-white" href="/cadastro">Ainda não tenho uma conta</Link></>}
        {mode === "signup" && <Link className="hover:text-white" href="/login">Já tenho uma conta</Link>}
        {mode === "recover" && <Link className="hover:text-white" href="/login">Voltar para o login</Link>}
      </div>
    </section>
  );
}

function Field({ label, name, type = "text", autoComplete }: { label: string; name: string; type?: string; autoComplete?: string }) {
  return (
    <label className="block text-sm font-semibold text-white/80">
      {label}
      <input required name={name} type={type} autoComplete={autoComplete} className="mt-2 w-full rounded-lg border border-white/15 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-white/25 focus:border-cyan-400" />
    </label>
  );
}
