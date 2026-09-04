import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type SearchParams = Promise<{ mode?: string }>;

export default async function AdminMatchmakingPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: isAdmin } = await supabase.rpc("is_current_platform_admin");
  if (!isAdmin) redirect("/");

  const [{ data: modes }, { data: entries }] = await Promise.all([
    supabase.from("queue_modes").select("id, name, slug, team_size, is_ranked, is_active, games(name, short_name)").order("created_at", { ascending: false }),
    supabase.from("matchmaking_queue_entries").select("id, status, joined_at, queue_modes(name, slug, games(name, short_name)), profiles(display_name, username)").eq("status", "queued").order("joined_at", { ascending: true }).limit(100),
  ]);

  const selected = params.mode ? modes?.find((mode) => mode.slug === params.mode) : undefined;
  const visibleEntries = selected ? entries?.filter((entry) => { const mode = Array.isArray(entry.queue_modes) ? entry.queue_modes[0] : entry.queue_modes; return mode?.slug === selected.slug; }) : entries;

  return <main className="min-h-screen bg-zinc-950 px-4 py-8 text-zinc-100 sm:px-8"><div className="mx-auto max-w-6xl">
    <div className="border-b border-zinc-800 pb-6"><Link href="/admin" className="text-sm text-cyan-400">← Administração</Link><h1 className="mt-3 text-3xl font-black">Matchmaking</h1><p className="mt-2 text-sm text-zinc-400">Acompanhe filas e jogadores aguardando partidas.</p></div>
    <section className="mt-8 grid gap-4 md:grid-cols-3"><Stat label="Modos configurados" value={modes?.length ?? 0}/><Stat label="Filas ativas" value={modes?.filter((mode) => mode.is_active).length ?? 0}/><Stat label="Jogadores aguardando" value={entries?.length ?? 0}/></section>
    <section className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6"><h2 className="font-bold">Filtrar por modo</h2><div className="mt-4 flex flex-wrap gap-2"><Link href="/admin/matchmaking" className={!params.mode ? "rounded-lg bg-cyan-500 px-3 py-2 text-sm font-bold text-zinc-950" : "rounded-lg border border-zinc-700 px-3 py-2 text-sm"}>Todas</Link>{modes?.map((mode) => <Link key={mode.id} href={`/admin/matchmaking?mode=${encodeURIComponent(mode.slug)}`} className={selected?.id === mode.id ? "rounded-lg bg-cyan-500 px-3 py-2 text-sm font-bold text-zinc-950" : "rounded-lg border border-zinc-700 px-3 py-2 text-sm"}>{mode.name}</Link>)}</div></section>
    <section className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6"><h2 className="font-bold">Jogadores na fila</h2><div className="mt-5 space-y-3">{visibleEntries?.map((entry) => { const profile = Array.isArray(entry.profiles) ? entry.profiles[0] : entry.profiles; const mode = Array.isArray(entry.queue_modes) ? entry.queue_modes[0] : entry.queue_modes; const game = Array.isArray(mode?.games) ? mode?.games[0] : mode?.games; return <div key={entry.id} className="flex flex-col justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-950/50 p-4 sm:flex-row sm:items-center"><div><p className="font-bold">{profile?.display_name ?? profile?.username ?? "Jogador"}</p><p className="mt-1 text-xs text-zinc-500">{game?.short_name ?? game?.name ?? "Jogo"} · {mode?.name ?? "Modo"}</p></div><time className="text-xs text-zinc-500">Entrou: {new Date(entry.joined_at).toLocaleString("pt-BR")}</time></div>; })}{!visibleEntries?.length && <p className="py-8 text-center text-sm text-zinc-500">Nenhum jogador aguardando nesta fila.</p>}</div></section>
  </div></main>;
}
function Stat({label,value}:{label:string;value:number}) { return <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5"><p className="text-sm text-zinc-400">{label}</p><p className="mt-2 text-3xl font-black">{value}</p></div>; }
