const articles = [
  { category: "PLATAFORMA", title: "RIO ESPORTS entra na fase de construção do núcleo competitivo", date: "EM DESENVOLVIMENTO" },
  { category: "MATCHMAKING", title: "A primeira experiência visual de filas competitivas está sendo preparada", date: "EM DESENVOLVIMENTO" },
  { category: "COMUNIDADE", title: "Equipes, jogadores e competições terão um espaço centralizado", date: "EM DESENVOLVIMENTO" },
];

export default function NewsPage() {
  return (
    <main className="min-h-screen bg-[#050505] px-6 py-12 text-white lg:px-8">
      <div className="mx-auto max-w-5xl">
        <a href="/" className="text-sm font-bold text-cyan-400">← VOLTAR</a>
        <p className="mt-12 text-xs font-black uppercase tracking-[0.3em] text-cyan-400">Notícias</p>
        <h1 className="mt-3 text-5xl font-black tracking-tight">O QUE ESTÁ ACONTECENDO.</h1>
        <div className="mt-12 grid gap-4">
          {articles.map((article) => (
            <article key={article.title} className="rounded-2xl border border-white/10 bg-white/[0.02] p-7 transition hover:border-cyan-400/40">
              <div className="flex flex-wrap items-center gap-3 text-xs font-bold"><span className="text-cyan-400">{article.category}</span><span className="text-white/30">{article.date}</span></div>
              <h2 className="mt-6 max-w-3xl text-2xl font-black">{article.title}</h2>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
