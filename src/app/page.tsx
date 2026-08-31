const games = [
  {
    name: "Counter-Strike 2",
    shortName: "CS2",
    status: "DISPONÍVEL",
    description: "Matchmaking competitivo, ranking e campeonatos.",
    active: true,
  },
  {
    name: "EA Sports FC",
    shortName: "FC",
    status: "EM BREVE",
    description: "Competições individuais e rankings.",
    active: false,
  },
  {
    name: "Street Fighter 6",
    shortName: "SF6",
    status: "EM BREVE",
    description: "Rankings e torneios de fighting games.",
    active: false,
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#050505] text-white">
      {/* NAVBAR */}
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-black font-black">
              R
            </div>

            <div>
              <div className="text-lg font-black tracking-tight">
                RIO<span className="text-cyan-400">ESPORTS</span>
              </div>
              <div className="text-[9px] uppercase tracking-[0.25em] text-white/40">
                Competitive Community
              </div>
            </div>
          </div>

          <nav className="hidden items-center gap-8 text-sm font-medium text-white/60 md:flex">
            <a className="text-white" href="#">
              INÍCIO
            </a>
            <a className="transition hover:text-white" href="#matchmaking">
              MATCHMAKING
            </a>
            <a className="transition hover:text-white" href="#campeonatos">
              CAMPEONATOS
            </a>
            <a className="transition hover:text-white" href="#ranking">
              RANKING
            </a>
          </nav>

          <button className="rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold transition hover:border-cyan-400/50 hover:bg-white/5">
            Entrar
          </button>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-cyan-400/10 blur-[140px]" />

        <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-28 lg:px-8 lg:pt-36">
          <div className="max-w-4xl">
            <div className="mb-6 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.3em] text-cyan-400">
              <span className="h-px w-8 bg-cyan-400" />
              Rio de Janeiro
            </div>

            <h1 className="text-5xl font-black leading-[0.95] tracking-[-0.04em] sm:text-7xl lg:text-8xl">
              A COMPETIÇÃO
              <br />
              <span className="text-white/30">COMEÇA AQUI.</span>
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-8 text-white/55 sm:text-xl">
              UMA PLATAFORMA COMPETITIVA PARA JOGADORES DO RIO
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <button className="rounded-lg bg-white px-7 py-4 text-sm font-black text-black transition hover:bg-cyan-400">
                ENTRAR COM STEAM
              </button>

              <button className="rounded-lg border border-white/15 px-7 py-4 text-sm font-bold transition hover:border-white/30 hover:bg-white/5">
                EXPLORAR CAMPEONATOS
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* GAMES */}
      <section className="border-y border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/30">
              Jogos
            </p>
            <h2 className="mt-2 text-2xl font-black">
              Escolha onde competir.
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {games.map((game) => (
              <div
                key={game.shortName}
                className={`rounded-xl border p-6 transition ${
                  game.active
                    ? "border-cyan-400/30 bg-cyan-400/[0.04] hover:border-cyan-400/60"
                    : "border-white/10 bg-white/[0.02] opacity-60"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="text-3xl font-black">{game.shortName}</div>

                  <span
                    className={`rounded-full px-3 py-1 text-[9px] font-black tracking-wider ${
                      game.active
                        ? "bg-cyan-400/10 text-cyan-400"
                        : "bg-white/10 text-white/40"
                    }`}
                  >
                    {game.status}
                  </span>
                </div>

                <h3 className="mt-8 font-bold">{game.name}</h3>

                <p className="mt-2 text-sm leading-6 text-white/40">
                  {game.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div className="grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:grid-cols-3">
          <Feature
            number="01"
            title="MATCHMAKING"
            description="Encontre jogadores do seu nível através de um sistema competitivo baseado em MMR."
            id="matchmaking"
          />

          <Feature
            number="02"
            title="CAMPEONATOS"
            description="Participe ou crie competições com diferentes formatos, equipes e fases."
            id="campeonatos"
          />

          <Feature
            number="03"
            title="RANKING"
            description="Construa sua reputação competitiva e descubra quem são os melhores jogadores."
            id="ranking"
          />
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-24 text-center lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-400">
            RIO ESPORTS
          </p>

          <h2 className="mx-auto mt-5 max-w-3xl text-4xl font-black tracking-tight sm:text-6xl">
            Seu jogo.
            <br />
            Seu ranking.
            <br />
            Sua comunidade.
          </h2>

          <button className="mt-10 rounded-lg bg-white px-8 py-4 text-sm font-black text-black transition hover:bg-cyan-400">
            COMEÇAR AGORA
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 px-6 py-8 text-xs text-white/30 sm:flex-row lg:px-8">
          <span>© 2026 RIO ESPORTS</span>
          <span>Rio de Janeiro, Brasil</span>
        </div>
      </footer>
    </main>
  );
}

function Feature({
  number,
  title,
  description,
  id,
}: {
  number: string;
  title: string;
  description: string;
  id: string;
}) {
  return (
    <div
      id={id}
      className="bg-[#080808] p-8 transition hover:bg-[#0d0d0d] lg:p-10"
    >
      <div className="text-xs font-bold text-cyan-400">{number}</div>

      <h3 className="mt-12 text-lg font-black tracking-wide">{title}</h3>

      <p className="mt-4 text-sm leading-7 text-white/40">{description}</p>
    </div>
  );
}