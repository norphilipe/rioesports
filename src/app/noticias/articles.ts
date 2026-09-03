export type NewsArticle = { slug: string; category: string; title: string; excerpt: string; read: string; featured?: boolean };

export const newsArticles: NewsArticle[] = [
  { slug: "o-cenario-competitivo-do-rio-ganha-uma-nova-casa", category: "RIO ESPORTS", title: "O cenário competitivo do Rio ganha uma nova casa", excerpt: "A RIO ESPORTS reúne comunidade, competição, rankings e conteúdo em um único ecossistema para jogadores.", read: "4 min", featured: true },
  { slug: "como-funcionara-o-ecossistema-competitivo", category: "COMPETITIVO", title: "Como funcionará o ecossistema competitivo da RIO ESPORTS", excerpt: "Matchmaking, identidade competitiva e reputação conectados em uma única plataforma.", read: "4 min" },
  { slug: "cs2-cobertura-em-breve", category: "CS2", title: "O que está movimentando o Counter-Strike competitivo", excerpt: "Cobertura, análises e os principais assuntos da comunidade competitiva.", read: "5 min" },
  { slug: "comunidade-jogadores-do-rio", category: "COMUNIDADE", title: "Jogadores do Rio terão um espaço próprio para competir", excerpt: "Uma comunidade construída para aproximar jogadores e fortalecer o cenário local.", read: "3 min" },
];
