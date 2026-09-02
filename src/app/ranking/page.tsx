import Link from "next/link";
import { RankingTable } from "@/components/ranking/ranking-table";

const previewPlayers = [
  { position: 1, nickname: "Aguardando dados", rating: 0, matches: 0, wins: 0 },
];

export default function RankingPage() {
  return (
    <main className="min-h-screen bg-[#050505] px-6 py-10 text-white lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="text-xs font-bold tracking-[0.18em] text-white/45 hover:text-white">← INÍCIO</Link>
        <div className="mt-8"><RankingTable players={previewPlayers} /></div>
      </div>
    </main>
  );
}
