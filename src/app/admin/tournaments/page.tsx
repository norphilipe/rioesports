import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createTournamentAction } from "./actions";

type SearchParams = Promise<{ error?: string; success?: string }>;

const statusLabel: Record<string, string> = {
  draft: "Rascunho",
  registration: "Inscrições abertas",
  checkin: "Check-in",
  running: "Em andamento",
  finished: "Finalizado",
  cancelled: "Cancelado",
};

const formatLabel: Record<string, string> = {
  single_elimination: "Eliminação simples",
  double_elimination: "Eliminação dupla",
  round_robin: "Todos contra todos",
  swiss: "Sistema suíço",
  groups_playoffs: "Grupos + playoffs",
};

export default async function AdminTournamentsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: isAdmin } = await supabase.rpc("is_current_platform_admin");
  if (!isAdmin) redirect("/");

  const [{ data: games }, { data: tournaments }] = await Promise.all([
    supabase.from("games").select("id, name, short_name").eq("is_active", true).order("name"),
    supabase.from("tournaments").select("id, name, slug, status, format, max_teams, start_at, games(name, short_name)").order("created_at", { ascending: false }),
  ]);

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 text-zinc-100 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 border-b border-zinc-800 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link href="/admin" className="text-sm text-cyan-400 hover:text-cyan-300">← Administração</Link>
            <h1 className="mt-3 text-3xl font-black tracking-tight">Campeonatos</h1>
            <p className="mt-2 text-sm text-zinc-400">Crie e acompanhe as competições oficiais da RIO ESPORTS.</p>
          </div>
        </div>

        {params.error ? <div className="mb-6 rounded-xl border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-200">{params.error}</div> : null}
        {params.success ? <div className="mb-6 rounded-xl border border-emerald-500/40 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-200">{params.success}</div> : null}

        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6">
            <h2 className="text-xl font-bold">Novo campeonato</h2>
            <form action={createTournamentAction} className="mt-6 space-y-4">
              <label className="block text-sm font-medium text-zinc-300">Nome<input name="name" required className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 outline-none focus:border-cyan-500" placeholder="Ex.: RIO ESPORTS OPEN" /></label>
              <label className="block text-sm font-medium text-zinc-300">Jogo<select name="game_id" required defaultValue="" className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 outline-none focus:border-cyan-500"><option value="" disabled>Selecione um jogo</option>{games?.map((game) => <option key={game.id} value={game.id}>{game.name} ({game.short_name})</option>)}</select></label>
              <label className="block text-sm font-medium text-zinc-300">Descrição<textarea name="description" rows={4} className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 outline-none focus:border-cyan-500" placeholder="Resumo da competição, regras e informações importantes." /></label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-zinc-300">Formato<select name="format" defaultValue="single_elimination" className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 outline-none focus:border-cyan-500">{Object.entries(formatLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
                <label className="block text-sm font-medium text-zinc-300">Status inicial<select name="status" defaultValue="draft" className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 outline-none focus:border-cyan-500"><option value="draft">Rascunho</option><option value="registration">Abrir inscrições</option></select></label>
                <label className="block text-sm font-medium text-zinc-300">Máximo de equipes<input name="max_teams" type="number" min="2" step="1" className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 outline-none focus:border-cyan-500" placeholder="16" /></label>
                <label className="block text-sm font-medium text-zinc-300">Melhor de<select name="best_of" defaultValue="1" className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 outline-none focus:border-cyan-500"><option value="1">MD1</option><option value="3">MD3</option><option value="5">MD5</option></select></label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-zinc-300">Início das inscrições<input name="registration_start" type="datetime-local" className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 outline-none focus:border-cyan-500" /></label>
                <label className="block text-sm font-medium text-zinc-300">Fim das inscrições<input name="registration_end" type="datetime-local" className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 outline-none focus:border-cyan-500" /></label>
              </div>
              <label className="block text-sm font-medium text-zinc-300">Data de início<input name="start_at" type="datetime-local" className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 outline-none focus:border-cyan-500" /></label>
              <button type="submit" className="w-full rounded-lg bg-cyan-500 px-4 py-3 font-bold text-zinc-950 transition hover:bg-cyan-400">Criar campeonato</button>
            </form>
          </section>

          <section>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Competições cadastradas</h2>
              <span className="text-sm text-zinc-500">{tournaments?.length ?? 0} total</span>
            </div>
            <div className="mt-4 space-y-3">
              {tournaments?.length ? tournaments.map((tournament) => {
                const game = Array.isArray(tournament.games) ? tournament.games[0] : tournament.games;
                return <article key={tournament.id} className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-400">{game?.short_name ?? game?.name ?? "Jogo"}</p>
                      <h3 className="mt-1 text-lg font-bold">{tournament.name}</h3>
                      <p className="mt-2 text-sm text-zinc-500">{formatLabel[tournament.format] ?? tournament.format} · {tournament.max_teams ? `${tournament.max_teams} equipes` : "Sem limite definido"}</p>
                    </div>
                    <span className="w-fit rounded-full border border-zinc-700 px-3 py-1 text-xs font-semibold text-zinc-300">{statusLabel[tournament.status] ?? tournament.status}</span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3 text-sm">
                    <Link href={`/campeonatos/${tournament.slug}`} className="text-cyan-400 hover:text-cyan-300">Ver página pública</Link>
                    <span className="text-zinc-700">·</span>
                    <span className="text-zinc-500">/{tournament.slug}</span>
                  </div>
                </article>;
              }) : <div className="rounded-xl border border-dashed border-zinc-800 p-8 text-center text-sm text-zinc-500">Nenhum campeonato criado ainda.</div>}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
