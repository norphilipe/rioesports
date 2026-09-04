import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminRankingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: isAdmin } = await supabase.rpc("is_current_platform_admin");
  if (!isAdmin) redirect("/");

  const [{ data: seasons }, { data: rankings }] = await Promise.all([
    supabase.from("game_seasons").select("id, name, is_active, starts_at, ends_at, games(name, short_name)").order("starts_at", { ascending: false }).limit(30),
    supabase.from("player_game_profiles").select("id, mmr, rank_name, wins, losses, provisional, profiles(display_name, username), games(name, short_name)").order("mmr", { ascending: false }).limit(100),
  ]);

  const activeSeasons = seasons?.filter((season) => season.is_active).length ?? 0;
  const averageMmr = rankings?.length ? Math.round(rankings.reduce((sum, player) => sum + (player.mmr ?? 0), 0) / rankings.length) : 0;

  return <main className="min-h-screen bg-zinc-950 px-4 py-8 text-zinc-100 sm:px-8"><div className="mx-auto max-w-6xl">
    <div className="border-b border-zinc-800 pb-6"><Link href="/admin" className="text-sm text-cyan-400">← Administração</Link><h1 className="mt-3 text-3xl font-black">Ranking e temporadas</h1><p className="mt-2 text-sm text-zinc-400">Acompanhe a estrutura competitiva e a classificação dos jogadores.</p></div>
    <section className="mt-8 grid gap-4 md:grid-cols-3"><Stat label="Temporadas cadastradas" value={seasons?.length ?? 0}/><Stat label="Temporadas ativas" value={activeSeasons}/><Stat label="MMR médio" value={averageMmr}/></section>
    <section className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6"><h2 className="font-bold">Temporadas</h2><div className="mt-5 grid gap-3 md:grid-cols-2">{seasons?.map((season) => { const game = Array.isArray(season.games) ? season.games[0] : season.games; return <div key={season.id} className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4"><div className="flex justify-between gap-3"><div><p className="font-bold">{season.name}</p><p className="mt-1 text-sm text-zinc-500">{game?.name ?? "Jogo"}</p></div><span className={season.is_active ? "rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-bold text-emerald-400" : "rounded-full bg-zinc-800 px-2 py-1 text-xs text-zinc-400"}>{season.is_active ? "Ativa" : "Encerrada"}</span></div></div>; })}{!seasons?.length && <p className="py-6 text-sm text-zinc-500">Nenhuma temporada cadastrada.</p>}</div></section>
    <section className="mt-8 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60"><div className="border-b border-zinc-800 p-6"><h2 className="font-bold">Classificação</h2><p className="mt-1 text-sm text-zinc-500">Top jogadores ordenados pelo MMR.</p></div><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="border-b border-zinc-800 text-xs uppercase tracking-wider text-zinc-500"><tr><th className="p-4">#</th><th className="p-4">Jogador</th><th className="p-4">Jogo</th><th className="p-4">MMR</th><th className="p-4">Rank</th><th className="p-4">W/L</th></tr></thead><tbody>{rankings?.map((player, index) => { const profile = Array.isArray(player.profiles) ? player.profiles[0] : player.profiles; const game = Array.isArray(player.games) ? player.games[0] : player.games; return <tr key={player.id} className="border-b border-zinc-800/70 last:border-0"><td className="p-4 font-black text-cyan-400">{index + 1}</td><td className="p-4"><p className="font-bold">{profile?.display_name ?? profile?.username ?? "Jogador"}</p><p className="text-xs text-zinc-500">@{profile?.username ?? "sem-usuario"}</p></td><td className="p-4 text-zinc-400">{game?.short_name ?? game?.name ?? "—"}</td><td className="p-4 font-bold">{player.mmr}</td><td className="p-4 text-zinc-400">{player.rank_name ?? (player.provisional ? "Provisório" : "Sem rank")}</td><td className="p-4 text-zinc-400">{player.wins} / {player.losses}</td></tr>; })}{!rankings?.length && <tr><td colSpan={6} className="p-10 text-center text-zinc-500">Ainda não existem jogadores classificados.</td></tr>}</tbody></table></div></section>
  </div></main>;
}
function Stat({label,value}:{label:string;value:number}) { return <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5"><p className="text-sm text-zinc-400">{label}</p><p className="mt-2 text-3xl font-black">{value}</p></div>; }
