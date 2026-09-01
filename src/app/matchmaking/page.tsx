import Link from "next/link";

const games = [
  {
    name: "Counter-Strike 2",
    mode: "Competitivo 5v5",
    status: "EM BREVE",
    description: "A primeira fila competitiva planejada para a RIO ESPORTS.",
    active: true,
  },
  {
    name: "EA Sports FC",
    mode: "Competitivo",
    status: "PLANEJADO",
    description: "Expansão futura do ecossistema competitivo.",
    active: false,
  },
  {
    name: "Street Fighter 6",
    mode: "1v1 ranqueado",
    status: "PLANEJADO",
    description: "Ranking e matchmaking para a comunidade de fighting games.",
    active: false,
  },
];

export default function MatchmakingPage() {
  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white font-black text-black">R</div>
            <div>
              <div className="text-lg font-black tracking-tight">RIO<span className="text-cyan-400">ESPORTS</span></div>
              <div className="text-[9px] uppercase tracking-[0.25em] text-white/40">Competitive Community</div>
            </div>
          </Link>
          <Link href="/" className="text-sm font-semibold text-white/60 transition hover:text-white">VOLTAR AO INÍCIO</Link>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[420px] w-[620px] -translate-x-1/2 rounded-full bg-cyan-400/10 blur-[140px]" />
        <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-400">Competitive Queue</p>
          <h1 className="mt-4 text-5xl font-black tracking-[-0.04em] sm:text-7xl">MATCHMAKING</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/55">
            Escolha um jogo e acompanhe a evolução das filas competitivas da RIO ESPORTS.
            O backend de matchmaking está sendo estruturado para funcionar com filas protegidas e formação transacional de partidas.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-8">
        <div className="grid gap-5 md:grid-cols-3">
          {games.map((game) => (
            <article key={game.name} className={`rounded-2xl border p-6 ${game.active ? "border-cyan-400/30 bg-cyan-400/[0.04]" : "border-white/10 bg-white/[0.02]"}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-cyan-400">{game.status}</p>
                  <h2 className="mt-4 text-2xl font-black">{game.name}</h2>
                </div>
              </div>
              <p className="mt-4 font-medium text-white/70">{game.mode}</p>
              <p className="mt-3 min-h-12 text-sm leading-6 text-white/40">{game.description}</p>
              <button disabled className="mt-8 w-full cursor-not-allowed rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white/40">
                Fila será liberada após a integração
              </button>
            </article>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-white/10 bg-white/[0.02] p-8">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">Em construção</p>
          <h2 className="mt-3 text-2xl font-black">Do banco de dados à partida.</h2>
          <div className="mt-6 grid gap-4 text-sm text-white/55 md:grid-cols-4">
            <p>01 — Perfil competitivo</p>
            <p>02 — Entrada na fila</p>
            <p>03 — Formação da partida</p>
            <p>04 — Ranking e resultados</p>
          </div>
        </div>
      </section>
    </main>
  );
}
