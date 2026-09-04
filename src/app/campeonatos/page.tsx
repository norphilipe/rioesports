import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const statusLabel: Record<string, string> = {
  registration: "Inscrições abertas",
  checkin: "Check-in",
  running: "Em andamento",
  finished: "Finalizado",
  cancelled: "Cancelado",
};

export default async function ChampionshipsPage() {
  const supabase = await createClient();
  const { data: tournaments } = await supabase
    .from("tournaments")
    .select("id, name, slug, description, status, format, max_teams, start_at, games(name, short_name)")
    .neq("status", "draft")
    .order("start_at", { ascending: true, nullsFirst: false });

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-10 text-zinc-100 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="text-sm text-cyan-400 hover:text-cyan-300">← RIO ESPORTS</Link>
        <div className="mt-5 max-w-3xl">
          <p className="text-xs font-bold tracking-[0.28em] text-cyan-400">COMPETIÇÕES OFICIAIS</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Campeonatos</h1>
          <p className="mt-4 text-zinc-400">Acompanhe as competições, inscrições e resultados da RIO ESPORTS.</p>
        </div>

        <section className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {tournaments?.length ? tournaments.map((tournament) => {
            const game = Array.isArray(tournament.games) ? tournament.games[0] : tournament.games;
            return <Link key={tournament.id} href={`/campeonatos/${tournament.slug}`} className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 transition hover:-translate-y-0.5 hover:border-cyan-500/50">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-400">{game?.short_name ?? game?.name ?? "RIO ESPORTS"}</p>
              <h2 className="mt-3 text-2xl font-bold">{tournament.name}</h2>
              <p className="mt-3 line-clamp-3 text-sm text-zinc-400">{tournament.description || "Informações da competição serão divulgadas em breve."}</p>
              <div className="mt-6 flex items-center justify-between border-t border-zinc-800 pt-4 text-sm">
                <span className="text-zinc-300">{statusLabel[tournament.status] ?? tournament.status}</span>
                <span className="text-cyan-400">Ver competição →</span>
              </div>
            </Link>;
          }) : <div className="col-span-full rounded-2xl border border-dashed border-zinc-800 py-16 text-center text-zinc-500">Ainda não há campeonatos publicados.</div>}
        </section>
      </div>
    </main>
  );
}
