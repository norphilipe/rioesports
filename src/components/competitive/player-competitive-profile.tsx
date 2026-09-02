import Link from "next/link";
import type { PlayerCompetitiveProfile as PlayerCompetitiveProfileData } from "@/lib/competitive/player-competitive-profile";

export function PlayerCompetitiveProfile({ profile }: { profile: PlayerCompetitiveProfileData }) {
  return <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
    <p className="text-xs font-bold tracking-[0.2em] text-cyan-400">COMPETITIVE PROFILE</p>
    <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
      <div><h1 className="text-3xl font-black">{profile.nickname}</h1><p className="mt-2 text-sm text-white/45">Histórico competitivo RIO ESPORTS</p></div>
      <div className="text-right"><p className="text-xs text-white/40">RATING</p><p className="text-4xl font-black text-cyan-300">{profile.rating}</p></div>
    </div>
    <div className="mt-8 grid grid-cols-2 gap-4"><div className="rounded-xl border border-white/10 p-4"><p className="text-xs text-white/40">PARTIDAS</p><p className="mt-1 text-2xl font-black">{profile.matches}</p></div><div className="rounded-xl border border-white/10 p-4"><p className="text-xs text-white/40">VITÓRIAS</p><p className="mt-1 text-2xl font-black">{profile.wins}</p></div></div>
    <div className="mt-8"><h2 className="font-black">Últimas partidas</h2><div className="mt-4 space-y-2">{profile.history.length ? profile.history.map((match) => <Link key={match.id} href={`/matches/${match.id}`} className="flex items-center justify-between rounded-xl border border-white/10 p-4 text-sm hover:bg-white/[0.03]"><span>#{match.id.slice(0, 8)}</span><span className={match.won ? "text-cyan-300" : "text-white/45"}>{match.won === null ? match.status.toUpperCase() : match.won ? "VITÓRIA" : "DERROTA"}</span></Link>) : <p className="rounded-xl border border-white/10 p-4 text-sm text-white/40">Nenhuma partida registrada.</p>}</div></div>
  </section>;
}
