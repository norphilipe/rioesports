const teams = [
  { name: "Echinata", game: "CS2", members: 5, status: "RECRUTANDO" },
  { name: "Baixada Esports", game: "CS2", members: 5, status: "ATIVA" },
  { name: "Carioca Fighters", game: "SF6", members: 8, status: "ATIVA" },
];

export default function TeamsPage() {
  return (
    <main className="min-h-screen bg-[#050505] px-6 py-12 text-white lg:px-8">
      <div className="mx-auto max-w-5xl">
        <a href="/" className="text-sm font-bold text-cyan-400">← VOLTAR</a>
        <p className="mt-12 text-xs font-black uppercase tracking-[0.3em] text-cyan-400">Equipes</p>
        <h1 className="mt-3 text-5xl font-black tracking-tight">ENCONTRE SUA TROPA.</h1>
        <p className="mt-5 max-w-2xl text-white/50">Uma prévia da futura área de equipes, convites e organização competitiva da plataforma.</p>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {teams.map((team) => (
            <article key={team.name} className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
              <div className="flex items-center justify-between"><span className="text-xs font-black text-cyan-400">{team.game}</span><span className="text-[10px] font-bold text-white/40">{team.status}</span></div>
              <h2 className="mt-10 text-2xl font-black">{team.name}</h2>
              <p className="mt-3 text-sm text-white/40">{team.members} membros na formação atual.</p>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
