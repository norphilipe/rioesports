import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type Params = Promise<{ slug: string }>;

const formatLabel: Record<string, string> = {
  single_elimination: "Eliminação simples",
  double_elimination: "Eliminação dupla",
  round_robin: "Todos contra todos",
  swiss: "Sistema suíço",
  groups_playoffs: "Grupos + playoffs",
};

const statusLabel: Record<string, string> = {
  registration: "Inscrições abertas",
  checkin: "Check-in",
  running: "Em andamento",
  finished: "Finalizado",
  cancelled: "Cancelado",
};

function formatDate(value: string | null) {
  if (!value) return "A definir";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeStyle: "short" }).format(new Date(value));
}

export default async function ChampionshipDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: tournament } = await supabase
    .from("tournaments")
    .select("id, name, slug, description, status, format, max_teams, best_of, registration_start, registration_end, start_at, games(name, short_name)")
    .eq("slug", slug)
    .neq("status", "draft")
    .maybeSingle();

  if (!tournament) notFound();

  const { data: registeredTeams } = await supabase
    .from("tournament_teams")
    .select("id, status, seed, teams(name, tag)")
    .eq("tournament_id", tournament.id)
    .order("seed", { ascending: true, nullsFirst: false });

  const game = Array.isArray(tournament.games) ? tournament.games[0] : tournament.games;

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-10 text-zinc-100 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <Link href="/campeonatos" className="text-sm text-cyan-400 hover:text-cyan-300">← Todos os campeonatos</Link>
        <header className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 sm:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-400">{game?.name ?? "RIO ESPORTS"}</p>
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-4xl font-black tracking-tight sm:text-5xl">{tournament.name}</h1>
              <p className="mt-4 max-w-3xl leading-7 text-zinc-400">{tournament.description || "Os detalhes desta competição serão divulgados pela organização."}</p>
            </div>
            <span className="w-fit rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-bold text-cyan-300">{statusLabel[tournament.status] ?? tournament.status}</span>
          </div>
        </header>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4"><p className="text-xs uppercase tracking-wider text-zinc-500">Formato</p><p className="mt-2 font-semibold">{formatLabel[tournament.format] ?? tournament.format}</p></div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4"><p className="text-xs uppercase tracking-wider text-zinc-500">Séries</p><p className="mt-2 font-semibold">MD{tournament.best_of}</p></div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4"><p className="text-xs uppercase tracking-wider text-zinc-500">Equipes</p><p className="mt-2 font-semibold">{registeredTeams?.length ?? 0}{tournament.max_teams ? ` / ${tournament.max_teams}` : " cadastradas"}</p></div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4"><p className="text-xs uppercase tracking-wider text-zinc-500">Início</p><p className="mt-2 font-semibold">{formatDate(tournament.start_at)}</p></div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h2 className="text-xl font-bold">Equipes participantes</h2>
            <div className="mt-5 space-y-3">
              {registeredTeams?.length ? registeredTeams.map((entry) => {
                const team = Array.isArray(entry.teams) ? entry.teams[0] : entry.teams;
                return <div key={entry.id} className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950/50 px-4 py-3"><span className="font-semibold">{team?.name ?? "Equipe"}{team?.tag ? <span className="ml-2 text-zinc-500">[{team.tag}]</span> : null}</span><span className="text-xs text-zinc-500">{entry.status}</span></div>;
              }) : <p className="rounded-lg border border-dashed border-zinc-800 p-5 text-sm text-zinc-500">Nenhuma equipe cadastrada ainda.</p>}
            </div>
          </div>

          <aside className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h2 className="text-xl font-bold">Cronograma</h2>
            <dl className="mt-5 space-y-5 text-sm">
              <div><dt className="text-zinc-500">Início das inscrições</dt><dd className="mt-1 font-medium">{formatDate(tournament.registration_start)}</dd></div>
              <div><dt className="text-zinc-500">Fim das inscrições</dt><dd className="mt-1 font-medium">{formatDate(tournament.registration_end)}</dd></div>
              <div><dt className="text-zinc-500">Início do campeonato</dt><dd className="mt-1 font-medium">{formatDate(tournament.start_at)}</dd></div>
            </dl>
          </aside>
        </section>
      </div>
    </main>
  );
}
