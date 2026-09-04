import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminModerationPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: isAdmin } = await supabase.rpc("is_current_platform_admin");
  if (!isAdmin) redirect("/");

  const [{ data: users }, { data: admins }] = await Promise.all([
    supabase.from("profiles").select("id, display_name, username, created_at").order("created_at", { ascending: false }).limit(100),
    supabase.from("platform_admins").select("user_id, role, created_at, profiles(display_name, username)").order("created_at", { ascending: false }),
  ]);

  const adminIds = new Set(admins?.map((admin) => admin.user_id) ?? []);

  return <main className="min-h-screen bg-zinc-950 px-4 py-8 text-zinc-100 sm:px-8"><div className="mx-auto max-w-6xl">
    <div className="border-b border-zinc-800 pb-6"><Link href="/admin" className="text-sm text-cyan-400">← Administração</Link><h1 className="mt-3 text-3xl font-black">Usuários e moderação</h1><p className="mt-2 text-sm text-zinc-400">Visão central dos usuários cadastrados e das contas com acesso administrativo.</p></div>
    <section className="mt-8 grid gap-4 md:grid-cols-3"><Stat label="Usuários exibidos" value={users?.length ?? 0}/><Stat label="Administradores" value={admins?.length ?? 0}/><Stat label="Usuários comuns" value={Math.max((users?.length ?? 0) - adminIds.size, 0)}/></section>
    <section className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6"><h2 className="font-bold">Administradores da plataforma</h2><div className="mt-5 space-y-3">{admins?.map((admin) => { const profile = Array.isArray(admin.profiles) ? admin.profiles[0] : admin.profiles; return <div key={admin.user_id} className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/50 p-4"><div><p className="font-bold">{profile?.display_name ?? profile?.username ?? "Administrador"}</p><p className="mt-1 text-xs text-zinc-500">@{profile?.username ?? "sem-usuario"}</p></div><span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-400">{admin.role}</span></div>; })}{!admins?.length && <p className="py-6 text-sm text-zinc-500">Nenhum administrador encontrado.</p>}</div></section>
    <section className="mt-8 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60"><div className="border-b border-zinc-800 p-6"><h2 className="font-bold">Usuários cadastrados</h2><p className="mt-1 text-sm text-zinc-500">Esta primeira versão permite consultar a base antes da implementação das ações disciplinares.</p></div><div className="divide-y divide-zinc-800">{users?.map((profile) => <div key={profile.id} className="flex flex-col justify-between gap-3 p-5 sm:flex-row sm:items-center"><div><p className="font-bold">{profile.display_name ?? profile.username ?? "Usuário"}</p><p className="mt-1 text-sm text-zinc-500">@{profile.username ?? "sem-usuario"}</p></div><div className="flex items-center gap-3"><span className={adminIds.has(profile.id) ? "rounded-full bg-cyan-500/10 px-2 py-1 text-xs font-bold text-cyan-400" : "rounded-full bg-zinc-800 px-2 py-1 text-xs text-zinc-400"}>{adminIds.has(profile.id) ? "Administrador" : "Usuário"}</span><time className="text-xs text-zinc-600">{new Date(profile.created_at).toLocaleDateString("pt-BR")}</time></div></div>)}{!users?.length && <div className="p-10 text-center text-sm text-zinc-500">Nenhum usuário cadastrado.</div>}</div></section>
  </div></main>;
}
function Stat({label,value}:{label:string;value:number}) { return <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5"><p className="text-sm text-zinc-400">{label}</p><p className="mt-2 text-3xl font-black">{value}</p></div>; }
