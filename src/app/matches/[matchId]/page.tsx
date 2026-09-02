import Link from "next/link";
import { ExternalMatchRoom } from "@/components/matches/external-match-room";
import { MatchResultForm } from "@/components/matches/match-result-form";

export default async function MatchRoomPage({ params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = await params;

  return (
    <main className="min-h-screen bg-[#050505] px-6 py-10 text-white lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link href="/matchmaking" className="text-xs font-bold tracking-[0.18em] text-white/45 hover:text-white">
          ← VOLTAR AO MATCHMAKING
        </Link>
        <div className="mt-8 space-y-6">
          <ExternalMatchRoom matchId={matchId} state="awaiting_result" />
          <MatchResultForm matchId={matchId} />
        </div>
      </div>
    </main>
  );
}
