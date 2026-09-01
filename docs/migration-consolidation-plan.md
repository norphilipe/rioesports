# Plano de consolidação das migrations

## Situação
As frentes de autenticação e hardening foram desenvolvidas em paralelo a partir de `main`. Ambas usam migrations incrementais e, portanto, não devem ser mescladas cegamente mantendo números concorrentes.

## Ordem canônica proposta

1. `001_initial_schema.sql`
2. `002_harden_foundation.sql`
3. `003_auth_profiles.sql`
4. `004_platform_hardening.sql`
5. `005_team_invitation_security.sql`

## Regra
Migrations históricas permanecem imutáveis. A consolidação deve ocorrer por uma branch dedicada e ser validada pelo CI antes de qualquer aplicação em um banco Supabase.

## Próxima etapa
Depois da consolidação, a próxima frente do MVP será modelar a camada competitiva: perfil por jogo, seleção de modo, fila e formação inicial de partidas.
