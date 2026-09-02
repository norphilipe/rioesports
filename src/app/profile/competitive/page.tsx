import Link from "next/link";
import { PlayerCompetitiveProfile } from "@/components/competitive/player-competitive-profile";
import { getPlayerCompetitiveProfile } from "@/lib/competitive/player-competitive-profile";
import { createClient } from "@/lib/supabase/server";

export default async function CompetitiveProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <main className="min-h-screen bg-[#050505] px-6 py-10 text-white"><div className="mx-auto max-w-3xl rounded-2xl border border-white/10 p-8 text-white/60">Faça login para visualizar seu perfil competitivo.</div></main>;
  }

  const profile = await getPlayerCompetitiveProfile(user.id);

  return (
    <main className="min-h-screen bg-[#050505] px-6 py-10 text-white lg:px-8">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-xs font-bold tracking-[0.18em] text-white/45 hover:text-white">← INÍCIO</Link>
        <div className="mt-8">{profile ? <PlayerCompetitiveProfile profile={profile} /> : <div className="rounded-2xl border border-white/10 p-8 text-white/50">Perfil competitivo ainda não disponível.</div>}</div>
      </div>
    </main>
  );
}
