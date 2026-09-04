import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const modules = [
  { icon: "📰", title: "Conteúdo", description: "Notícias, categorias e páginas institucionais.", href: "/admin/conteudo" },
  { icon: "🏆", title: "Campeonatos", description: "Competições, inscrições, equipes, partidas e resultados.", href: "/admin/campeonatos" },
  { icon: "🎮", title: "Matchmaking", description: "Filas, partidas, configurações e penalidades.", href: "/admin/matchmaking" },
  { icon: "📈", title: "Rankings", description: "Temporadas, rankings, pontuações e histórico competitivo.", href: "/admin/rankings" },
  { icon: "👥", title: "Usuários", description: "Jogadores, administradores, permissões e banimentos.", href: "/admin/usuarios" },
  { icon: "⚙️", title: "Configurações", description: "Parâmetros globais e futuras integrações da plataforma.", href: "/admin/configuracoes" },
];

export default async function AdminPage() {
  const supabase = await createClient();
  const [
    { count: games },
    { count: tournaments },
    { count: liveMatches },
    { count: queuedPlayers },
  ] = await Promise.all([
    supabase.from("games").select("*", { count: "exact", head: true }),
    supabase.from("tournaments").select("*", { count: "exact", head: true }).in("status", ["registration", "checkin", "running"]),
    supabase.from("matches").select("*", { count: "exact", head: true }).eq("status", "live"),
    supabase.from("matchmaking_queue_entries").select("*", { count: "exact", head: true }).eq("status", "queued"),
  ]);

  const stats = [
    ["Jogos configurados", games ?? 0],
    ["Campeonatos ativos", tournaments ?? 0],
    ["Partidas ao vivo", liveMatches ?? 0],
    ["Jogadores na fila", queuedPlayers ?? 0],
  ];

  return (
    <main className="p-6 lg:p-10">
      <div className="mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-400">Administração</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Controle o Rio Esports.</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/50">Central operacional para administrar conteúdo, campeonatos, matchmaking, rankings, usuários e configurações.</p>
        </div>
        <Link href="/" className="rounded-lg border border-white/15 px-4 py-2 text-center text-sm font-semibold text-white/70 transition hover:border-cyan-400/50 hover:text-white">Ver site ↗</Link>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(([label, value]) => (
          <div key={String(label)} className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
            <p className="text-sm text-white/45">{label}</p>
            <p className="mt-2 text-3xl font-black text-cyan-300">{value}</p>
          </div>
        ))}
      </section>

      <section className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {modules.map((module) => (
          <Link key={module.title} href={module.href} className="group rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition hover:border-cyan-400/50 hover:bg-cyan-400/[0.04]">
            <div className="flex items-start justify-between"><span className="text-3xl">{module.icon}</span><span className="text-xs font-black text-cyan-400 opacity-0 transition group-hover:opacity-100">ABRIR →</span></div>
            <h2 className="mt-8 text-xl font-black">{module.title}</h2>
            <p className="mt-3 text-sm leading-6 text-white/45">{module.description}</p>
          </Link>
        ))}
      </section>

      <section className="mt-10 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.04] p-6">
        <p className="text-sm font-black text-emerald-300">Acesso administrativo protegido</p>
        <p className="mt-2 text-sm leading-6 text-white/50">O painel agora depende de uma conta autenticada com função administrativa ativa. A fundação também libera o acesso seguro aos dados competitivos para os módulos internos.</p>
      </section>
    </main>
  );
}
