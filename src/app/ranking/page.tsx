import Link from "next/link";
import { RankingTable } from "@/components/ranking/ranking-table";
import { getCompetitiveLeaderboard, type LeaderboardEntry } from "@/lib/competitive/leaderboard";

export default async function RankingPage() {
  let players: LeaderboardEntry[] = [];
  let unavailable = false;

  try {
    players = await getCompetitiveLeaderboard();
  } catch {
    unavailable = true;
  }

  return (
    <main className="min-h-screen bg-[#050505] px-6 py-10 text-white lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="text-xs font-bold tracking-[0.18em] text-white/45 hover:text-white">← INÍCIO</Link>
        {unavailable && <p className="mt-6 rounded-lg border border-white/10 bg-white/[0.02] p-4 text-sm text-white/50">O ranking ainda não está disponível. Tente novamente em instantes.</p>}
        <div className="mt-8"><RankingTable players={players} /></div>
      </div>
    </main>
  );
}
