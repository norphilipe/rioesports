import { createClient } from "@/lib/supabase/server";

export default async function AdminMatchmakingPage() {
  const supabase = await createClient();
  const [{ data: modes }, { count: queued }, { count: liveMatches }] = await Promise.all([
    supabase.from("queue_modes").select("id, name, slug, team_size, is_ranked, is_active, games(name, short_name)").order("created_at", { ascending: false }),
    supabase.from("matchmaking_queue_entries").select("*", { count: "exact", head: true }).eq("status", "queued"),
    supabase.from("matches").select("*", { count: "exact", head: true }).eq("match_type", "matchmaking").eq("status", "live"),
  ]);

  const activeModes = modes?.filter((mode) => mode.is_active).length ?? 0;

  return <main className="p-6 lg:p-10">
    <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-400">Competitivo</p>
    <h1 className="mt-3 text-4xl font-black">Matchmaking</h1>
    <p className="mt-3 max-w-2xl text-white/50">Central de controle das filas, modos competitivos e partidas geradas pela plataforma.</p>

    <div className="mt-10 grid gap-4 md:grid-cols-3"><Status label="Filas ativas" value={activeModes}/><Status label="Jogadores aguardando" value={queued ?? 0}/><Status label="Partidas em andamento" value={liveMatches ?? 0}/></div>

    <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.025] p-6">
      <div className="flex items-center justify-between"><div><h2 className="font-black">Modos de fila</h2><p className="mt-1 text-sm text-white/45">Configurações atualmente cadastradas para matchmaking.</p></div><span className="text-sm font-black text-cyan-300">{modes?.length ?? 0}</span></div>
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {modes?.map((mode) => { const game = Array.isArray(mode.games) ? mode.games[0] : mode.games; return <div key={mode.id} className="rounded-xl border border-white/10 p-5"><div className="flex items-start justify-between gap-3"><div><p className="font-black">{mode.name}</p><p className="mt-1 text-sm text-white/45">{game?.name ?? "Jogo não identificado"} · {mode.team_size}v{mode.team_size}</p></div><span className={mode.is_active ? "rounded-full bg-emerald-400/10 px-2 py-1 text-[10px] font-black uppercase text-emerald-300" : "rounded-full bg-white/5 px-2 py-1 text-[10px] font-black uppercase text-white/40"}>{mode.is_active ? "Ativa" : "Inativa"}</span></div><div className="mt-4 flex gap-2"><span className="rounded-md bg-white/5 px-2 py-1 text-xs text-white/50">{mode.is_ranked ? "Ranqueda" : "Casual"}</span><span className="rounded-md bg-white/5 px-2 py-1 text-xs text-white/50">/{mode.slug}</span></div></div>; })}
        {!modes?.length && <div className="rounded-xl border border-dashed border-white/10 p-10 text-center md:col-span-2"><h3 className="font-black">Nenhuma fila configurada</h3><p className="mt-2 text-sm text-white/45">A base competitiva está pronta para receber o primeiro modo de jogo.</p></div>}
      </div>
    </section>
  </main>;
}
function Status({label,value}:{label:string;value:number}) { return <div className="rounded-xl border border-white/10 bg-white/[0.025] p-5"><p className="text-sm text-white/45">{label}</p><p className="mt-2 text-3xl font-black">{value}</p></div>; }
