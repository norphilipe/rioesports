import Link from "next/link";

const featured = {
  category: "RIO ESPORTS",
  title: "O cenário competitivo do Rio ganha uma nova casa",
  excerpt: "A RIO ESPORTS reúne comunidade, competição, rankings e conteúdo em um único ecossistema para jogadores.",
  date: "EM BREVE",
};

const stories = [
  { category: "CS2", title: "O que está movimentando o Counter-Strike competitivo", excerpt: "Cobertura, análises e os principais assuntos da comunidade competitiva.", read: "5 min" },
  { category: "COMPETITIVO", title: "Como funcionará o ecossistema competitivo da RIO ESPORTS", excerpt: "Matchmaking, identidade competitiva e reputação conectados em uma única plataforma.", read: "4 min" },
  { category: "COMUNIDADE", title: "Jogadores do Rio terão um espaço próprio para competir", excerpt: "Uma comunidade construída para aproximar jogadores e fortalecer o cenário local.", read: "3 min" },
  { category: "CAMPEONATOS", title: "A próxima fase da competição começa pela comunidade", excerpt: "Torneios e experiências competitivas fazem parte da evolução planejada da plataforma.", read: "4 min" },
];

const categories = ["TODAS", "CS2", "VALORANT", "LEAGUE OF LEGENDS", "ESPORTS", "RIO ESPORTS"];

export default function NoticiasPage() {
  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-5 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white font-black text-black">R</div>
            <div>
              <div className="text-lg font-black tracking-tight">RIO<span className="text-cyan-400">ESPORTS</span></div>
              <div className="text-[9px] uppercase tracking-[0.25em] text-white/40">Competitive Community</div>
            </div>
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-medium text-white/55 md:flex">
            <Link className="transition hover:text-white" href="/">INÍCIO</Link>
            <Link className="text-white" href="/noticias">NOTÍCIAS</Link>
            <Link className="transition hover:text-white" href="/matchmaking">MATCHMAKING</Link>
            <Link className="transition hover:text-white" href="/perfil">PERFIL</Link>
          </nav>
          <Link href="/login" className="rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold transition hover:border-cyan-400/50">Entrar</Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24">
        <div className="flex flex-col justify-between gap-8 border-b border-white/10 pb-10 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.35em] text-cyan-400">Central editorial</p>
            <h1 className="mt-4 text-5xl font-black tracking-[-0.04em] sm:text-7xl">NOTÍCIAS<span className="text-cyan-400">.</span></h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/50">Esports, jogos, comunidade e tudo o que movimenta o cenário competitivo.</p>
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/30">RIO ESPORTS JOURNAL</p>
        </div>

        <div className="flex gap-3 overflow-x-auto py-8">
          {categories.map((category, index) => <button key={category} className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs font-bold tracking-wide transition ${index === 0 ? "border-cyan-400 bg-cyan-400 text-black" : "border-white/10 text-white/55 hover:border-white/30 hover:text-white"}`}>{category}</button>)}
        </div>

        <section className="grid gap-5 border-y border-white/10 py-10 lg:grid-cols-[1.5fr_1fr]">
          <article className="group relative min-h-[420px] overflow-hidden rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-400/[0.12] via-[#0a0a0a] to-[#050505] p-8 lg:p-12">
            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-cyan-400/15 blur-[100px]" />
            <div className="relative flex h-full flex-col justify-end">
              <span className="mb-auto inline-flex w-fit rounded-full bg-cyan-400/10 px-3 py-1 text-[10px] font-black tracking-[0.18em] text-cyan-300">{featured.category}</span>
              <p className="mt-20 text-xs font-bold tracking-wider text-white/35">{featured.date}</p>
              <h2 className="mt-4 max-w-3xl text-3xl font-black leading-tight sm:text-5xl">{featured.title}</h2>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-white/55 sm:text-base">{featured.excerpt}</p>
              <button className="mt-8 w-fit text-xs font-black uppercase tracking-[0.2em] text-cyan-300">Ler matéria →</button>
            </div>
          </article>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-7">
              <span className="text-[10px] font-black tracking-[0.18em] text-cyan-400">EM DESENVOLVIMENTO</span>
              <h3 className="mt-5 text-2xl font-black">Um portal feito para acompanhar o cenário.</h3>
              <p className="mt-4 text-sm leading-7 text-white/45">A central editorial está sendo construída para receber notícias próprias, cobertura especializada e fontes externas autorizadas.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-7">
              <span className="text-[10px] font-black tracking-[0.18em] text-cyan-400">EM BREVE</span>
              <h3 className="mt-5 text-2xl font-black">Cobertura organizada por jogos.</h3>
              <p className="mt-4 text-sm leading-7 text-white/45">CS2, VALORANT, League of Legends e os principais acontecimentos do esports em um só lugar.</p>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="mb-8 flex items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.25em] text-white/30">Atualizações</p><h2 className="mt-3 text-3xl font-black">Últimas notícias</h2></div><span className="text-xs text-white/30">MAIS RECENTES</span></div>
          <div className="grid gap-4 md:grid-cols-2">
            {stories.map((story, index) => (
              <article key={story.title} className="group rounded-xl border border-white/10 bg-white/[0.02] p-6 transition hover:border-cyan-400/35 hover:bg-cyan-400/[0.025]">
                <div className="flex items-center justify-between"><span className="text-[10px] font-black tracking-[0.18em] text-cyan-400">{story.category}</span><span className="text-xs text-white/25">{story.read}</span></div>
                <div className="mt-8 flex gap-5"><span className="text-3xl font-black text-white/10">0{index + 1}</span><div><h3 className="text-xl font-black leading-snug">{story.title}</h3><p className="mt-3 text-sm leading-6 text-white/45">{story.excerpt}</p><button className="mt-6 text-xs font-black uppercase tracking-wider text-white/70 transition group-hover:text-cyan-300">Continuar lendo →</button></div></div>
              </article>
            ))}
          </div>
        </section>
      </section>
      <footer className="border-t border-white/10"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 px-6 py-8 text-xs text-white/30 sm:flex-row lg:px-8"><span>© 2026 RIO ESPORTS</span><span>RIO ESPORTS JOURNAL</span></div></footer>
    </main>
  );
}
