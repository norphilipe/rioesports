import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminRankingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: isAdmin } = await supabase.rpc("is_current_platform_admin");
  if (!isAdmin) redirect("/");

  return <main className="min-h-screen bg-zinc-950 px-4 py-8 text-zinc-100 sm:px-8"><div className="mx-auto max-w-4xl"><Link href="/admin" className="text-sm text-cyan-400">← Administração</Link><div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8"><p className="text-xs font-bold tracking-[0.25em] text-cyan-400">RIO ESPORTS / RANKING</p><h1 className="mt-3 text-3xl font-black">Ranking e temporadas</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">Este módulo administrativo está preparado e protegido, mas não expõe controles fictícios. Ele será conectado somente quando o modelo canônico de temporadas, classificação e pontuação estiver consolidado no banco e no matchmaking.</p><div className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-200">Nenhuma alteração operacional está disponível aqui ainda para evitar inconsistências entre ranking, partidas e temporadas.</div></div></div></main>;
}
