# RIO ESPORTS

Plataforma competitiva de esports voltada à comunidade do Rio de Janeiro.

## Principais módulos

- autenticação e perfis de jogadores;
- equipes e campeonatos;
- matchmaking competitivo;
- integração operacional com FACEIT;
- integração de identidade competitiva com Steam;
- ranking e estatísticas;
- painel administrativo;
- moderação e restrições competitivas;
- notícias e conteúdo da plataforma.

## Arquitetura

- **Aplicação:** Next.js + TypeScript
- **Banco e autenticação:** Supabase
- **Deploy:** Cloudflare Workers via OpenNext
- **Automação:** GitHub Actions

## Desenvolvimento local

### 1. Instale as dependências

```bash
npm install
```

### 2. Configure o ambiente

Copie `.env.example` para `.env.local` e preencha as variáveis necessárias.

```bash
cp .env.example .env.local
```

Nunca envie `.env.local` ou segredos reais ao GitHub.

### 3. Execute a aplicação

```bash
npm run dev
```

## Validação

Antes de abrir um pull request, execute:

```bash
npm run lint
npm run typecheck
npm run build
npm run build:next
```

O GitHub Actions executa essas validações automaticamente em pull requests e na branch `main`.

## Deploy

Pushes para `main` acionam o pipeline de deploy para a Cloudflare.

Os segredos de infraestrutura devem permanecer configurados exclusivamente no provedor correspondente e nunca no código-fonte.

## Banco de dados

As alterações estruturais ficam em `supabase/migrations/`.

Migrations históricas devem ser tratadas como imutáveis quando já aplicadas em produção. Novas alterações devem ser adicionadas como novas migrations para preservar a rastreabilidade dos ambientes.

## Administração e moderação

Operações administrativas sensíveis devem ser protegidas no servidor e/ou no banco. A interface administrativa não deve ser a única camada de autorização.

## Integrações externas

A disponibilidade operacional de integrações externas depende da configuração das respectivas credenciais e segredos nos ambientes de produção. Consulte `.env.example` para identificar as variáveis esperadas pela aplicação.
