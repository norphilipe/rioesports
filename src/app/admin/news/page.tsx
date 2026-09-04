import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createNewsAction } from "./actions";

type SearchParams = Promise<{ error?: string; success?: string }>;

const labels: Record<string, string> = { draft: "Rascunho", published: "Publicada", scheduled: "Agendada" };

export default async function AdminNewsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: isAdmin } = await supabase.rpc("is_current_platform_admin");
  if (!isAdmin) redirect("/");

  const { data: posts } = await supabase.from("news_posts").select("id, title, slug, status, published_at, scheduled_at, created_at").order("created_at", { ascending: false }).limit(100);
  const drafts = posts?.filter((post) => post.status === "draft").length ?? 0;
  const published = posts?.filter((post) => post.status === "published").length ?? 0;
  const scheduled = posts?.filter((post) => post.status === "scheduled").length ?? 0;

  return <main className="min-h-screen bg-zinc-950 px-4 py-8 text-zinc-100 sm:px-8"><div className="mx-auto max-w-6xl">
    <div className="border-b border-zinc-800 pb-6"><Link href="/admin" className="text-sm text-cyan-400">← Administração</Link><h1 className="mt-3 text-3xl font-black">Notícias</h1><p className="mt-2 text-sm text-zinc-400">Crie, publique e organize o conteúdo editorial da RIO ESPORTS.</p></div>
    <section className="mt-8 grid gap-4 md:grid-cols-3"><Stat label="Publicadas" value={published}/><Stat label="Rascunhos" value={drafts}/><Stat label="Agendadas" value={scheduled}/></section>
    {params.error ? <div className="mt-6 rounded-xl border border-red-500/40 bg-red-950/30 p-4 text-sm text-red-200">{params.error}</div> : null}{params.success ? <div className="mt-6 rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-4 text-sm text-emerald-200">{params.success}</div> : null}
    <section className="mt-8 grid gap-8 lg:grid-cols-[1fr_0.9fr]"><form action={createNewsAction} className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6"><h2 className="text-xl font-bold">Nova notícia</h2><div className="mt-6 space-y-4"><Field label="Título" name="title" required placeholder="Digite o título da notícia"/><Field label="Resumo" name="excerpt" textarea placeholder="Resumo que aparecerá nas listagens"/><Field label="Imagem de capa (URL)" name="cover_image_url" placeholder="https://..."/><Field label="Conteúdo" name="content" textarea required placeholder="Escreva a notícia completa"/><label className="block text-sm font-medium text-zinc-300">Status<select name="status" defaultValue="draft" className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5"><option value="draft">Salvar como rascunho</option><option value="published">Publicar agora</option><option value="scheduled">Agendar publicação</option></select></label><label className="block text-sm font-medium text-zinc-300">Publicação agendada<input name="scheduled_at" type="datetime-local" className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5"/></label><button className="w-full rounded-lg bg-cyan-500 px-4 py-3 font-bold text-zinc-950">Salvar notícia</button></div></form>
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6"><div className="flex items-center justify-between"><h2 className="text-xl font-bold">Conteúdos recentes</h2><span className="text-sm text-zinc-500">{posts?.length ?? 0}</span></div><div className="mt-5 space-y-3">{posts?.map((post) => <article key={post.id} className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4"><div className="flex justify-between gap-3"><div><h3 className="font-bold">{post.title}</h3><p className="mt-1 text-xs text-zinc-500">/{post.slug}</p></div><span className="h-fit rounded-full bg-zinc-800 px-2 py-1 text-xs text-zinc-300">{labels[post.status]}</span></div>{post.status === "published" ? <Link href={`/noticias/${post.slug}`} className="mt-3 inline-block text-sm text-cyan-400">Ver notícia →</Link> : null}</article>)}{!posts?.length && <p className="py-8 text-center text-sm text-zinc-500">Nenhuma notícia criada ainda.</p>}</div></div></section>
  </div></main>;
}
function Stat({label,value}:{label:string;value:number}) { return <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5"><p className="text-sm text-zinc-400">{label}</p><p className="mt-2 text-3xl font-black">{value}</p></div>; }
function Field({label,name,textarea,required,placeholder}:{label:string;name:string;textarea?:boolean;required?:boolean;placeholder?:string}) { const className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5"; return <label className="block text-sm font-medium text-zinc-300">{label}{textarea ? <textarea name={name} required={required} rows={name === "content" ? 10 : 3} placeholder={placeholder} className={className}/> : <input name={name} required={required} placeholder={placeholder} className={className}/>}</label>; }
