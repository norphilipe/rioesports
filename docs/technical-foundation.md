# RIO ESPORTS — Fundação técnica

Esta etapa consolida a base para a evolução da plataforma sem implementar ainda o matchmaking.

## Banco e Supabase

- `supabase/migrations` é a única fonte executável de migrations.
- `001_initial_schema.sql` permanece histórico e não deve ser reescrito.
- `002_harden_foundation.sql` adiciona proteções incrementais para dados operacionais, estatísticas, convites e futuras consultas de matchmaking.
- RLS deve ser tratado junto com grants: habilitar RLS por si só não remove privilégios SQL existentes.

## Aplicação

As credenciais públicas do Supabase são validadas em `src/lib/env.ts`. A chave publicável pode existir no frontend; chaves secretas/service-role nunca devem ser colocadas no browser.

## Fluxo de desenvolvimento

1. Criar uma branch pequena e revisável.
2. Alterar migrations de forma incremental.
3. Executar lint, typecheck e build.
4. Abrir Pull Request.
5. Revisar a PR antes de qualquer merge.

## Próxima etapa

A autenticação e as primeiras rotas protegidas devem ser concluídas antes do matchmaking. O matchmaking será construído posteriormente sobre esta fundação, com MMR e estatísticas controlados pelo servidor.
