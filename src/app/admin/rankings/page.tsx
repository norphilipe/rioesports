import { createClient } from "@/lib/supabase/server";

export default async function AdminRankingsPage() {
  const supabase = await createClient();
  const [{ data: seasons }, { data: players }] = await Promise.all([
    supabase.from("game_seasons").select("id, name, is_active, starts_at, ends_at, games(name, short_name)").order("starts_at", { ascending: false }).limit(12),
    supabase.from("player_game_profiles").select("id, mmr, rank_name, wins, losses, provisional, profiles(display_name, username), games(name, short_name)").order("mmr", { ascending: false }).limit(20),
  ]);

  const activeSeasons = seasons?.filter((season) => season.is_active).length ?? 0;

  return (
    <main className="p-6 lg:p-10">
      <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-400">Competitivo</p>
      <h1 className="mt-3 text-4xl font-black">Rankings</h1>
      <p className="mt-3 max-w-2xl text-white/50">Acompanhe temporadas e classificações reais da plataforma sem depender de posições editadas manualmente.</p>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        <Stat label="Temporadas cadastradas" value={seasons?.length ?? 0} />
        <Stat label="Temporadas ativas" value={activeSeasons} />
        <Stat label="Jogadores exibidos" value={players?.length ?? 0} />
      </section>

      <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.025] p-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div><h2 className="font-black">Classificação atual</h2><p className="mt-1 text-sm text-white/45">Ordenada pelo MMR registrado no perfil competitivo.</p></div>
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">Top {players?.length ?? 0}</span>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="border-b border-white/10 text-xs uppercase tracking-wider text-white/35"><tr><th className="pb-3">#</th><th className="pb-3">Jogador</th><th className="pb-3">Jogo</th><th className="pb-3">MMR</th><th className="pb-3">Rank</th><th className="pb-3">W/L</th></tr></thead>
            <tbody>
              {players?.map((player, index) => {
                const profile = Array.isArray(player.profiles) ? player.profiles[0] : player.profiles;
                const game = Array.isArray(player.games) ? player.games[0] : player.games;
                return <tr key={player.id} className="border-b border-white/[0.06] last:border-0"><td className="py-4 font-black text-cyan-300">{index + 1}</td><td className="py-4"><div className="font-bold">{profile?.display_name ?? "Jogador"}</div><div className="text-xs text-white/35">@{profile?.username ?? "sem-username"}</div></td><td className="py-4 text-white/60">{game?.short_name ?? game?.name ?? "—"}</td><td className="py-4 font-black">{player.mmr}</td><td className="py-4 text-white/60">{player.rank_name ?? (player.provisional ? "Provisório" : "Sem classificação")}</td><td className="py-4 text-white/60">{player.wins} / {player.losses}</td></tr>;
              })}
              {!players?.length && <tr><td colSpan={6} className="py-12 text-center text-white/40">Ainda não existem perfis competitivos para exibir.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.025] p-6">
        <h2 className="font-black">Temporadas</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {seasons?.map((season) => {
            const game = Array.isArray(season.games) ? season.games[0] : season.games;
            return <div key={season.id} className="rounded-xl border border-white/10 p-4"><div className="flex items-center justify-between gap-3"><p className="font-bold">{season.name}</p><span className={season.is_active ? "rounded-full bg-emerald-400/10 px-2 py-1 text-[10px] font-black uppercase text-emerald-300" : "rounded-full bg-white/5 px-2 py-1 text-[10px] font-black uppercase text-white/40"}>{season.is_active ? "Ativa" : "Encerrada"}</span></div><p className="mt-2 text-sm text-white/45">{game?.name ?? "Jogo não identificado"}</p></div>;
          })}
          {!seasons?.length && <p className="text-sm text-white/40">Nenhuma temporada cadastrada.</p>}
        </div>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return <div className="rounded-xl border border-white/10 bg-white/[0.025] p-5"><p className="text-sm text-white/45">{label}</p><p className="mt-2 text-3xl font-black">{value}</p></div>;
}
