import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminNewsPage() {
  const supabase = await createClient();
  const [{ data: articles }, { count: published }, { count: drafts }, { count: scheduled }] = await Promise.all([
    supabase.from("news_articles").select("id, title, slug, status, created_at, published_at").order("created_at", { ascending: false }).limit(50),
    supabase.from("news_articles").select("*", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("news_articles").select("*", { count: "exact", head: true }).eq("status", "draft"),
    supabase.from("news_articles").select("*", { count: "exact", head: true }).eq("status", "scheduled"),
  ]);
  const stats = [["Publicadas", published ?? 0], ["Rascunhos", drafts ?? 0], ["Agendadas", scheduled ?? 0]];

  return <main className="p-6 lg:p-10">
    <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
      <div><p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-400">Conteúdo</p><h1 className="mt-3 text-4xl font-black">Notícias</h1><p className="mt-3 text-white/50">Crie, publique e acompanhe as notícias do Rio Esports.</p></div>
      <Link href="/admin/noticias/nova" className="rounded-lg bg-cyan-400 px-5 py-3 text-center font-black text-black transition hover:bg-cyan-300">+ Nova notícia</Link>
    </div>
    <div className="mt-10 grid gap-4 sm:grid-cols-3">{stats.map(([label, value]) => <div key={String(label)} className="rounded-xl border border-white/10 bg-white/[0.025] p-5"><p className="text-sm text-white/45">{label}</p><p className="mt-2 text-3xl font-black text-cyan-300">{value}</p></div>)}</div>
    <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
      <div className="flex items-center justify-between"><div><h2 className="font-black">Biblioteca de notícias</h2><p className="mt-1 text-sm text-white/45">Últimas publicações e conteúdos em preparação.</p></div><span className="text-sm font-black text-cyan-300">{articles?.length ?? 0}</span></div>
      <div className="mt-6 grid gap-3">
        {articles?.map((article) => <article key={article.id} className="flex flex-col justify-between gap-4 rounded-xl border border-white/10 p-5 md:flex-row md:items-center"><div><h3 className="font-black">{article.title}</h3><p className="mt-1 text-sm text-white/45">/noticias/{article.slug}</p></div><div className="flex items-center gap-3"><span className={article.status === "published" ? "rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-black text-emerald-300" : article.status === "scheduled" ? "rounded-full bg-amber-400/10 px-3 py-1 text-xs font-black text-amber-300" : "rounded-full bg-white/5 px-3 py-1 text-xs font-black text-white/50"}>{statusLabel(article.status)}</span><span className="text-xs text-white/35">{formatDate(article.published_at ?? article.created_at)}</span></div></article>)}
        {!articles?.length && <div className="rounded-xl border border-dashed border-white/10 p-10 text-center"><p className="text-lg font-black">Nenhuma notícia cadastrada</p><p className="mt-2 text-sm text-white/45">Crie a primeira publicação usando o botão acima.</p></div>}
      </div>
    </section>
  </main>;
}
function statusLabel(status: string) { return ({ published: "Publicada", draft: "Rascunho", scheduled: "Agendada" } as Record<string, string>)[status] ?? status; }
function formatDate(value: string) { return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(new Date(value)); }
