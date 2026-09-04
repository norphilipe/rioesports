import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type Params = Promise<{ slug: string }>;

export default async function NewsDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase.from("news_posts").select("title, slug, excerpt, content, cover_image_url, published_at").eq("slug", slug).eq("status", "published").lte("published_at", new Date().toISOString()).maybeSingle();
  if (!post) notFound();
  return <main className="min-h-screen bg-[#050505] text-white"><header className="border-b border-white/10"><div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5"><Link href="/noticias" className="text-sm font-bold text-white/60">← NOTÍCIAS</Link><Link href="/" className="font-black">RIO<span className="text-cyan-400">ESPORTS</span></Link></div></header><article className="mx-auto max-w-3xl px-6 py-20"><p className="text-xs font-black tracking-[0.25em] text-cyan-400">RIO ESPORTS JOURNAL</p><h1 className="mt-6 text-4xl font-black leading-tight sm:text-6xl">{post.title}</h1>{post.published_at ? <time className="mt-5 block text-sm text-white/40">{new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(new Date(post.published_at))}</time> : null}{post.cover_image_url ? <img src={post.cover_image_url} alt="" className="mt-10 w-full rounded-2xl border border-white/10"/> : null}{post.excerpt ? <p className="mt-10 text-xl leading-8 text-white/50">{post.excerpt}</p> : null}<div className="my-12 h-px bg-white/10"/><div className="whitespace-pre-wrap text-lg leading-9 text-white/70">{post.content}</div><div className="mt-14 border-t border-white/10 pt-8"><Link href="/noticias" className="text-sm font-black text-cyan-300">← VOLTAR PARA TODAS AS NOTÍCIAS</Link></div></article></main>;
}
