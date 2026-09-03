import Link from "next/link";

const articles: Record<string, { category: string; title: string; excerpt: string; body: string[] }> = {
  "o-cenario-competitivo-do-rio-ganha-uma-nova-casa": {
    category: "RIO ESPORTS",
    title: "O cenário competitivo do Rio ganha uma nova casa",
    excerpt: "A RIO ESPORTS reúne comunidade, competição, rankings e conteúdo em um único ecossistema para jogadores.",
    body: ["A RIO ESPORTS nasce com uma proposta clara: criar um espaço digital dedicado à comunidade competitiva e conectar jogadores por meio de experiências, informações e competições.", "A plataforma está sendo construída em etapas. A primeira delas estabelece a identidade dos jogadores e os recursos fundamentais para a comunidade. A evolução incluirá novas experiências competitivas, rankings e conteúdo editorial.", "A Central de Notícias faz parte dessa visão. O objetivo é construir um espaço organizado para acompanhar o cenário dos jogos, o esports e as novidades da própria comunidade."]
  },
  "como-funcionara-o-ecossistema-competitivo": {
    category: "COMPETITIVO",
    title: "Como funcionará o ecossistema competitivo da RIO ESPORTS",
    excerpt: "Matchmaking, identidade competitiva e reputação conectados em uma única plataforma.",
    body: ["A experiência competitiva da RIO ESPORTS será desenvolvida de forma progressiva, priorizando estabilidade e uma boa experiência para os jogadores.", "Perfis, histórico competitivo e matchmaking são alguns dos elementos que formarão a base do ecossistema.", "A proposta é que cada evolução seja integrada à identidade do jogador e à comunidade, em vez de existir como ferramentas isoladas."]
  },
};

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = articles[slug];
  if (!article) return <main className="min-h-screen bg-[#050505] px-6 py-24 text-white"><div className="mx-auto max-w-3xl"><p className="text-cyan-400">NOTÍCIA NÃO ENCONTRADA</p><Link href="/noticias" className="mt-6 inline-block underline">Voltar para Notícias</Link></div></main>;
  return <main className="min-h-screen bg-[#050505] text-white"><header className="border-b border-white/10"><div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5"><Link href="/noticias" className="text-sm font-bold text-white/60 transition hover:text-white">← NOTÍCIAS</Link><Link href="/" className="font-black">RIO<span className="text-cyan-400">ESPORTS</span></Link></div></header><article className="mx-auto max-w-3xl px-6 py-20"><p className="text-xs font-black tracking-[0.25em] text-cyan-400">{article.category}</p><h1 className="mt-6 text-4xl font-black leading-tight tracking-tight sm:text-6xl">{article.title}</h1><p className="mt-7 text-xl leading-8 text-white/50">{article.excerpt}</p><div className="my-12 h-px bg-white/10" />{article.body.map((paragraph) => <p key={paragraph} className="mb-7 text-lg leading-9 text-white/70">{paragraph}</p>)}<div className="mt-14 border-t border-white/10 pt-8"><Link href="/noticias" className="text-sm font-black text-cyan-300">← VOLTAR PARA TODAS AS NOTÍCIAS</Link></div></article></main>;
}