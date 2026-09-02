type ExternalMatchRoomProps = {
  matchId: string;
  state: "pending" | "ready" | "in_progress" | "awaiting_result" | "completed" | "disputed";
  teamA?: string[];
  teamB?: string[];
};

const labels = {
  pending: "AGUARDANDO JOGADORES",
  ready: "PRONTA PARA COMEÇAR",
  in_progress: "PARTIDA EM ANDAMENTO",
  awaiting_result: "AGUARDANDO RESULTADO",
  completed: "PARTIDA CONCLUÍDA",
  disputed: "RESULTADO EM ANÁLISE",
};

export function ExternalMatchRoom({ matchId, state, teamA = [], teamB = [] }: ExternalMatchRoomProps) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold tracking-[0.22em] text-cyan-400">MATCH ROOM</p>
          <h2 className="mt-2 text-2xl font-black">CS2 5V5</h2>
          <p className="mt-1 text-xs text-white/35">ID #{matchId.slice(0, 8)}</p>
        </div>
        <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-300">{labels[state]}</span>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-[1fr_auto_1fr] md:items-center">
        <div className="rounded-xl border border-white/10 p-5">
          <p className="text-xs font-bold text-cyan-400">TIME A</p>
          <div className="mt-4 space-y-2 text-sm text-white/70">
            {teamA.length ? teamA.map((player) => <p key={player}>{player}</p>) : <p className="text-white/30">Aguardando escalação</p>}
          </div>
        </div>
        <div className="text-center text-2xl font-black text-white/25">VS</div>
        <div className="rounded-xl border border-white/10 p-5">
          <p className="text-xs font-bold text-cyan-400">TIME B</p>
          <div className="mt-4 space-y-2 text-sm text-white/70">
            {teamB.length ? teamB.map((player) => <p key={player}>{player}</p>) : <p className="text-white/30">Aguardando escalação</p>}
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-white/10 bg-black/20 p-5 text-sm text-white/55">
        {state === "ready" && "Organize a partida externa e retorne aqui após o término para registrar o resultado."}
        {state === "in_progress" && "A partida está sendo disputada externamente."}
        {state === "awaiting_result" && "Envie o resultado ou uma demo da partida para iniciar a verificação."}
        {state === "disputed" && "Os resultados enviados estão em conflito e precisam ser revisados."}
        {(state === "pending" || state === "completed") && (state === "pending" ? "A sala será liberada quando a formação da partida estiver concluída." : "Resultado verificado e aplicado ao ranking competitivo.")}
      </div>
    </section>
  );
}
