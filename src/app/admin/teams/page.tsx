import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminTeamsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: isAdmin } = await supabase.rpc("is_current_platform_admin");
  if (!isAdmin) redirect("/");
  const [{ data: teams }, { count: members }] = await Promise.all([
    supabase.from("teams").select("id, name, slug, created_at, team_members(count)").order("created_at", { ascending: false }).limit(100),
    supabase.from("team_members").select("id", { count: "exact", head: true }),
  ]);
  return <main className="min-h-screen bg-zinc-950 px-4 py-8 text-zinc-100 sm:px-8"><div className="mx-auto max-w-6xl"><div className="border-b border-zinc-800 pb-6"><Link href="/admin" className="text-sm text-cyan-400">← Administração</Link><h1 className="mt-3 text-3xl font-black">Equipes</h1><p className="mt-2 text-sm text-zinc-400">Visão central das equipes cadastradas e seus participantes.</p></div><div className="mt-8 grid gap-4 md:grid-cols-2"><Stat label="Equipes cadastradas" value={teams?.length ?? 0}/><Stat label="Vínculos de jogadores" value={members ?? 0}/></div><section className="mt-8 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60"><div className="border-b border-zinc-800 p-6"><h2 className="font-bold">Equipes registradas</h2></div><div className="divide-y divide-zinc-800">{teams?.map((team) => { const memberData = Array.isArray(team.team_members) ? team.team_members[0] : team.team_members; const count = typeof memberData?.count === "number" ? memberData.count : 0; return <div key={team.id} className="flex flex-col justify-between gap-3 p-5 sm:flex-row sm:items-center"><div><p className="font-bold">{team.name}</p><p className="mt-1 text-sm text-zinc-500">/{team.slug}</p></div><div className="text-sm text-zinc-400">{count} integrante{count === 1 ? "" : "s"}</div></div>; })}{!teams?.length && <div className="p-10 text-center text-sm text-zinc-500">Nenhuma equipe cadastrada.</div>}</div></section></div></main>;
}
function Stat({label,value}:{label:string;value:number}) { return <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5"><p className="text-sm text-zinc-400">{label}</p><p className="mt-2 text-3xl font-black">{value}</p></div>; }