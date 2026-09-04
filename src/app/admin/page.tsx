import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: isAdmin } = await supabase.rpc("is_current_platform_admin");
  if (!isAdmin) redirect("/");
  const [tournamentsResult, teamsResult, queueResult, usersResult] = await Promise.all([
    supabase.from("tournaments").select("id", { count: "exact", head: true }),
    supabase.from("teams").select("id", { count: "exact", head: true }),
    supabase.from("matchmaking_queue_entries").select("id", { count: "exact", head: true }).eq("status", "queued"),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
  ]);
  const cards = [
    { label: "Campeonatos", value: tournamentsResult.count ?? 0, href: "/admin/tournaments", description: "Criar, editar e acompanhar competições" },
    { label: "Equipes", value: teamsResult.count ?? 0, href: "/admin/teams", description: "Gerenciar equipes e participantes" },
    { label: "Fila ativa", value: queueResult.count ?? 0, href: "/admin/matchmaking", description: "Acompanhar operações de matchmaking" },
    { label: "Usuários", value: usersResult.count ?? 0, href: "/admin/moderation", description: "Consultar usuários e administradores" },
  ];
  const modules = [
    ["🏆", "Campeonatos", "/admin/tournaments", "Criar e acompanhar competições"],
    ["👥", "Equipes", "/admin/teams", "Consultar equipes e integrantes"],
    ["🎮", "Matchmaking", "/admin/matchmaking", "Monitorar filas competitivas"],
    ["📈", "Ranking", "/admin/rankings", "Ranking e temporadas"],
    ["📰", "Notícias", null, "Próximo módulo editorial"],
    ["🛡️", "Moderação", "/admin/moderation", "Usuários e administradores"],
  ] as const;
  return <main className="min-h-screen bg-zinc-950 px-4 py-8 text-zinc-100 sm:px-8"><div className="mx-auto max-w-6xl"><div className="mb-8 flex flex-col gap-4 border-b border-zinc-800 pb-6 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold tracking-[0.28em] text-cyan-400">RIO ESPORTS / ADMINISTRAÇÃO</p><h1 className="mt-2 text-3xl font-black tracking-tight">Central de controle</h1><p className="mt-2 max-w-2xl text-sm text-zinc-400">Administre as áreas operacionais da plataforma a partir de um único painel.</p></div><Link href="/" className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-200">Voltar ao site</Link></div><section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{cards.map((card) => <Link key={card.label} href={card.href} className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 transition hover:border-cyan-500/50"><p className="text-sm text-zinc-400">{card.label}</p><p className="mt-3 text-4xl font-black">{card.value}</p><p className="mt-4 text-sm text-zinc-500">{card.description}</p></Link>)}</section><section className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6"><h2 className="text-lg font-bold">Módulos administrativos</h2><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{modules.map(([icon, label, href, description]) => href ? <Link key={label} href={href} className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 transition hover:border-cyan-500/50"><span className="text-lg">{icon}</span><p className="mt-2 font-bold">{label}</p><p className="mt-1 text-xs text-zinc-500">{description}</p></Link> : <div key={label} className="rounded-xl border border-zinc-800 bg-zinc-950/30 p-4 text-zinc-500"><span className="text-lg">{icon}</span><p className="mt-2 font-bold">{label}</p><p className="mt-1 text-xs">{description}</p></div>)}</div></section></div></main>;
}
