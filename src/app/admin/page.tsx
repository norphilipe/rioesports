import Link from "next/link";

const modules = [
  { icon: "📰", title: "Conteúdo", description: "Notícias, categorias e páginas institucionais.", href: "/admin/conteudo" },
  { icon: "🏆", title: "Campeonatos", description: "Competições, inscrições, equipes, partidas e resultados.", href: "/admin/campeonatos" },
  { icon: "🎮", title: "Matchmaking", description: "Filas, partidas, configurações e penalidades.", href: "/admin/matchmaking" },
  { icon: "📈", title: "Rankings", description: "Temporadas, rankings, pontuações e histórico competitivo.", href: "/admin/rankings" },
  { icon: "👥", title: "Usuários", description: "Jogadores, administradores, permissões e banimentos.", href: "/admin/usuarios" },
  { icon: "⚙️", title: "Configurações", description: "Parâmetros globais e futuras integrações da plataforma.", href: "/admin/configuracoes" },
];

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-[#070707] text-white">
      <header className="border-b border-white/10 bg-[#0b0b0b]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-5 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-400 font-black text-black">R</div>
            <div>
              <div className="font-black tracking-tight">RIO ESPORTS <span className="text-cyan-400">ADMIN</span></div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-white/35">Central de Administração</div>
            </div>
          </div>
          <Link href="/" className="rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-white/70 transition hover:border-cyan-400/50 hover:text-white">Ver site</Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="mb-12">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-400">Administração</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Controle o Rio Esports.</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/50">Esta será a central para administrar conteúdo, campeonatos, matchmaking, rankings, usuários e configurações da plataforma.</p>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {modules.map((module) => (
            <Link key={module.title} href={module.href} className="group rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition hover:border-cyan-400/50 hover:bg-cyan-400/[0.04]">
              <div className="flex items-start justify-between"><span className="text-3xl">{module.icon}</span><span className="text-xs font-black text-cyan-400 opacity-0 transition group-hover:opacity-100">ABRIR →</span></div>
              <h2 className="mt-8 text-xl font-black">{module.title}</h2>
              <p className="mt-3 text-sm leading-6 text-white/45">{module.description}</p>
            </Link>
          ))}
        </section>

        <section className="mt-10 rounded-2xl border border-amber-400/20 bg-amber-400/[0.04] p-6">
          <p className="text-sm font-black text-amber-300">Próxima etapa: segurança e permissões</p>
          <p className="mt-2 text-sm leading-6 text-white/50">O painel visual está disponível, mas o acesso será protegido antes de os módulos administrativos receberem operações críticas. A próxima implementação definirá cargos, permissões e o primeiro administrador.</p>
        </section>
      </div>
    </main>
  );
}
