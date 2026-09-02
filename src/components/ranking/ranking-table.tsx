export type RankingPlayer = {
  position: number;
  nickname: string;
  rating: number;
  matches: number;
  wins: number;
};

export function RankingTable({ players }: { players: RankingPlayer[] }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
      <div>
        <p className="text-xs font-bold tracking-[0.2em] text-cyan-400">COMPETITIVE</p>
        <h1 className="mt-2 text-3xl font-black">Ranking</h1>
        <p className="mt-2 text-sm text-white/45">Os melhores jogadores da comunidade RIO ESPORTS.</p>
      </div>
      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[620px] text-left">
          <thead className="border-b border-white/10 text-xs tracking-[0.12em] text-white/35">
            <tr><th className="pb-4">#</th><th className="pb-4">JOGADOR</th><th className="pb-4">RATING</th><th className="pb-4">PARTIDAS</th><th className="pb-4">VITÓRIAS</th></tr>
          </thead>
          <tbody className="text-sm">
            {players.map((player) => <tr key={`${player.position}-${player.nickname}`} className="border-b border-white/5">
              <td className="py-5 font-black text-cyan-300">{player.position}</td>
              <td className="py-5 font-bold">{player.nickname}</td>
              <td className="py-5 font-black">{player.rating}</td>
              <td className="py-5 text-white/60">{player.matches}</td>
              <td className="py-5 text-white/60">{player.wins}</td>
            </tr>)}
          </tbody>
        </table>
      </div>
    </section>
  );
}
