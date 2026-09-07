import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminModerationPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: isAdmin } = await supabase.rpc("is_current_platform_admin");
  if (!isAdmin) redirect("/");

  const now = new Date().toISOString();
  const [{ data: users }, { data: admins }, { data: actions }] = await Promise.all([
    supabase.from("profiles").select("id,display_name,username,created_at").order("created_at", { ascending: false }).limit(100),
    supabase.from("platform_admins").select("profile_id,role,profiles(display_name,username)"),
    supabase.from("platform_moderation_actions").select("id,target_profile_id,moderator_profile_id,action_type,reason,metadata,expires_at,created_at").order("created_at", { ascending: false }).limit(100),
  ]);

  const active = actions?.filter((action) => !action.expires_at || action.expires_at > now).length ?? 0;
  const usersById = new Map(users?.map((profile) => [profile.id, profile]) ?? []);

  return <main className="min-h-screen bg-zinc-950 px-4 py-8 text-zinc-100 sm:px-8"><div className="mx-auto max-w-6xl"><Link href="/admin" className="text-sm text-cyan-400">← Administração</Link><h1 className="mt-3 text-3xl font-black">Usuários e moderação</h1><p className="mt-2 text-sm text-zinc-400">Histórico centralizado de ações disciplinares da plataforma.</p><section className="mt-8 grid gap-4 md:grid-cols-3"><Stat label="Usuários" value={users?.length ?? 0}/><Stat label="Administradores" value={admins?.length ?? 0}/><Stat label="Ações ativas" value={active}/></section><section className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/60"><h2 className="border-b border-zinc-800 p-6 font-bold">Histórico disciplinar</h2><div className="divide-y divide-zinc-800">{actions?.map((action) => { const target = usersById.get(action.target_profile_id); const moderator = action.moderator_profile_id ? usersById.get(action.moderator_profile_id) : null; const isActive = !action.expires_at || action.expires_at > now; return <div key={action.id} className="p-5"><div className="flex flex-col justify-between gap-4 sm:flex-row"><div><p className="font-bold">{target?.display_name ?? target?.username ?? "Usuário"}</p><p className="mt-2 text-sm text-zinc-400">{action.reason ?? "Sem motivo informado."}</p><p className="mt-2 text-xs text-zinc-500">Moderador: {moderator?.display_name ?? moderator?.username ?? "Sistema"}</p></div><div className="flex h-fit gap-2"><span className="rounded-full bg-red-500/10 px-2 py-1 text-xs text-red-300">{action.action_type}</span><span className={`rounded-full px-2 py-1 text-xs ${isActive ? "bg-amber-500/10 text-amber-300" : "bg-zinc-700 text-zinc-300"}`}>{isActive ? "Ativa" : "Expirada"}</span></div></div></div>;})}{!actions?.length && <p className="p-8 text-center text-zinc-500">Nenhuma ação disciplinar registrada.</p>}</div></section></div></main>;
}

function Stat({ label, value }: { label: string; value: number }) { return <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5"><p className="text-sm text-zinc-400">{label}</p><p className="mt-2 text-3xl font-black">{value}</p></div>; }
