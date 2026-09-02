import Link from "next/link";
import { ExternalMatchRoom } from "@/components/matches/external-match-room";
import { MatchResultForm } from "@/components/matches/match-result-form";
import { getMatchRoomData } from "@/lib/competitive/match-room-data";

export default async function MatchRoomPage({ params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = await params;
  const match = await getMatchRoomData(matchId);

  return (
    <main className="min-h-screen bg-[#050505] px-6 py-10 text-white lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link href="/matchmaking" className="text-xs font-bold tracking-[0.18em] text-white/45 hover:text-white">← VOLTAR AO MATCHMAKING</Link>
        {match ? (
          <div className="mt-8 space-y-6">
            <ExternalMatchRoom matchId={matchId} state={match.state} teamA={match.teamA} teamB={match.teamB} />
            {match.state === "awaiting_result" && match.teamAId && match.teamBId && <MatchResultForm matchId={matchId} teamAId={match.teamAId} teamBId={match.teamBId} />}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-white/10 p-8 text-white/50">Partida não encontrada.</div>
        )}
      </div>
    </main>
  );
}
