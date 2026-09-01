# Núcleo competitivo do MVP

## Objetivo
Estabelecer a primeira camada funcional para o fluxo competitivo da RIO ESPORTS: jogador -> perfil por jogo -> modo competitivo -> fila -> formação de partida.

## Princípios
- O servidor é a fonte de verdade para estados competitivos.
- Um jogador só pode entrar em uma fila usando um perfil de jogo elegível.
- Uma entrada ativa não pode pertencer simultaneamente a filas incompatíveis.
- A formação de partidas deve ser transacional e auditável.
- O resultado de uma partida não deve ser decidido diretamente pelo cliente.

## Entidades propostas

### queue_modes
Define os modos competitivos disponíveis para cada jogo.

Campos principais:
- `id`
- `game_id`
- `slug`
- `name`
- `team_size`
- `is_ranked`
- `is_active`

### matchmaking_queue_entries
Representa a intenção ativa de um jogador de encontrar uma partida.

Campos principais:
- `id`
- `queue_mode_id`
- `profile_id`
- `player_game_profile_id`
- `rating_snapshot`
- `status`
- `queued_at`
- `matched_at`
- `cancelled_at`

Estados:
- `queued`
- `matched`
- `cancelled`
- `expired`

### match_participants
Representa a participação individual em uma partida formada pelo matchmaking.

Campos principais:
- `match_id`
- `profile_id`
- `team_slot`
- `side`
- `joined_at`

## Invariantes
1. No máximo uma entrada `queued` por jogador e modo competitivo.
2. Uma entrada só pode ser associada a uma partida uma única vez.
3. A criação da partida e a atualização das entradas devem ocorrer na mesma transação.
4. Clientes não podem alterar diretamente estados de matchmaking críticos.
5. O sistema deve manter histórico suficiente para auditoria futura.

## Próximas entregas
1. Validar o schema existente contra essas entidades.
2. Criar migration incremental sem alterar migrations históricas.
3. Implementar operações server-owned para entrar e sair da fila.
4. Implementar a primeira estratégia determinística de formação de partidas.
5. Cobrir o fluxo com validações de tipo, lint, build e testes quando a infraestrutura de testes estiver disponível.
