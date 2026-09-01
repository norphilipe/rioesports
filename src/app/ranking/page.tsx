const rankings = [
  { position: 1, player: "FURIA RIO", rating: 2840, trend: "+32" },
  { position: 2, player: "CariocaFPS", rating: 2795, trend: "+18" },
  { position: 3, player: "TropaCS", rating: 2710, trend: "+11" },
  { position: 4, player: "LapaStrike", rating: 2655, trend: "+7" },
  { position: 5, player: "ZonaSul", rating: 2590, trend: "+4" },
];

export default function RankingPage() {
  return (
    <main className="min-h-screen bg-[#050505] px-6 py-12 text-white lg:px-8">
      <div className="mx-auto max-w-5xl">
        <a href="/" className="text-sm font-bold text-cyan-400">← VOLTAR</a>
        <p className="mt-12 text-xs font-black uppercase tracking-[0.3em] text-cyan-400">Ranking</p>
        <h1 className="mt-3 text-5xl font-black tracking-tight">QUEM DOMINA O RIO.</h1>
        <p className="mt-5 max-w-2xl text-white/50">Prévia da experiência de ranking competitivo da RIO ESPORTS. Os dados serão conectados ao sistema real de MMR conforme o núcleo de matchmaking evoluir.</p>
        <section className="mt-12 overflow-hidden rounded-2xl border border-white/10">
          {rankings.map((entry) => (
            <div key={entry.position} className="grid grid-cols-[64px_1fr_auto] items-center border-b border-white/10 bg-white/[0.02] p-5 last:border-b-0">
              <span className="text-xl font-black text-white/35">#{entry.position}</span>
              <span className="font-bold">{entry.player}</span>
              <div className="text-right"><strong>{entry.rating}</strong><span className="ml-3 text-xs text-cyan-400">{entry.trend}</span></div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
