import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminTournamentsPage() {
  const supabase = await createClient();
  const [{ data: tournaments }, { count: registrationsOpen }, { count: pendingMatches }] = await Promise.all([
    supabase.from("tournaments").select("id, name, slug, status, format, max_teams, start_at, games(name, short_name)").order("created_at", { ascending: false }).limit(20),
    supabase.from("tournaments").select("*", { count: "exact", head: true }).eq("status", "registration"),
    supabase.from("matches").select("*", { count: "exact", head: true }).eq("match_type", "tournament").in("status", ["pending", "ready"]),
  ]);

  const active = tournaments?.filter((tournament) => ["registration", "checkin", "running"].includes(tournament.status)).length ?? 0;

  return <main className="p-6 lg:p-10">
    <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-400">Competitivo</p>
    <div className="mt-3 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><h1 className="text-4xl font-black">Campeonatos</h1><p className="mt-3 text-white/50">Acompanhe competições reais, inscrições e partidas vinculadas ao banco de dados.</p></div><Link href="/admin/campeonatos/novo" className="rounded-lg bg-cyan-400 px-5 py-3 text-center font-black text-black">+ Novo campeonato</Link></div>

    <div className="mt-10 grid gap-4 md:grid-cols-3"><Card title="Campeonatos ativos" value={active}/><Card title="Inscrições abertas" value={registrationsOpen ?? 0}/><Card title="Partidas pendentes" value={pendingMatches ?? 0}/></div>

    <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.025] p-6">
      <div className="flex items-center justify-between"><div><h2 className="font-black">Competições cadastradas</h2><p className="mt-1 text-sm text-white/45">Últimos campeonatos criados na plataforma.</p></div><span className="text-sm font-black text-cyan-300">{tournaments?.length ?? 0}</span></div>
      <div className="mt-6 grid gap-3">
        {tournaments?.map((tournament) => { const game = Array.isArray(tournament.games) ? tournament.games[0] : tournament.games; return <div key={tournament.id} className="flex flex-col justify-between gap-4 rounded-xl border border-white/10 p-5 md:flex-row md:items-center"><div><p className="font-black">{tournament.name}</p><p className="mt-1 text-sm text-white/45">{game?.name ?? "Jogo não identificado"} · {formatLabel(tournament.format)}</p></div><div className="flex items-center gap-3"><span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-black uppercase text-cyan-300">{statusLabel(tournament.status)}</span><span className="text-sm text-white/40">{tournament.max_teams ? `${tournament.max_teams} equipes` : "Sem limite"}</span></div></div>; })}
        {!tournaments?.length && <div className="rounded-xl border border-dashed border-white/10 p-10 text-center"><h3 className="font-black">Nenhum campeonato cadastrado</h3><p className="mt-2 text-sm text-white/45">Use o botão acima para iniciar a primeira competição.</p></div>}
      </div>
    </section>
  </main>;
}
function Card({title,value}:{title:string;value:number}) { return <div className="rounded-xl border border-white/10 bg-white/[0.025] p-5"><p className="text-sm text-white/45">{title}</p><p className="mt-2 text-3xl font-black">{value}</p></div>; }
function statusLabel(status: string) { return ({ draft: "Rascunho", registration: "Inscrições", checkin: "Check-in", running: "Em andamento", finished: "Finalizado", cancelled: "Cancelado" } as Record<string, string>)[status] ?? status; }
function formatLabel(format: string) { return ({ single_elimination: "Eliminação simples", double_elimination: "Eliminação dupla", round_robin: "Pontos corridos", swiss: "Suíço", groups_playoffs: "Grupos + playoffs" } as Record<string, string>)[format] ?? format; }
