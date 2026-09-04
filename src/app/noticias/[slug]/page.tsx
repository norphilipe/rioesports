import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: article } = await supabase
    .from("news_posts")
    .select("title,slug,excerpt,content,published_at,created_at")
    .eq("slug", slug)
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .maybeSingle();
  if (!article) notFound();
  const date = article.published_at ?? article.created_at;
  const paragraphs: string[] = article.content.split(/\n{2,}/).filter(Boolean);
  return <main className="min-h-screen bg-[#050505] text-white"><header className="border-b border-white/10"><div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5"><Link href="/noticias" className="text-sm font-bold text-white/60 transition hover:text-white">← NOTÍCIAS</Link><Link href="/" className="font-black">RIO<span className="text-cyan-400">ESPORTS</span></Link></div></header><article className="mx-auto max-w-3xl px-6 py-20"><p className="text-xs font-black tracking-[0.25em] text-cyan-400">RIO ESPORTS JOURNAL</p><h1 className="mt-6 text-4xl font-black leading-tight tracking-tight sm:text-6xl">{article.title}</h1>{article.excerpt&&<p className="mt-7 text-xl leading-8 text-white/50">{article.excerpt}</p>}<p className="mt-6 text-xs text-white/30">{date ? new Date(date).toLocaleDateString("pt-BR") : ""}</p><div className="my-12 h-px bg-white/10" />{paragraphs.map((paragraph: string, index: number)=><p key={index} className="mb-7 whitespace-pre-line text-lg leading-9 text-white/70">{paragraph}</p>)}<div className="mt-14 border-t border-white/10 pt-8"><Link href="/noticias" className="text-sm font-black text-cyan-300">← VOLTAR PARA TODAS AS NOTÍCIAS</Link></div></article></main>;
}