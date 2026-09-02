# Matchmaking Policy Foundation

The initial matchmaking policy uses a deterministic rating window that expands with queue wait time.

## Initial defaults

- Target match size: 10 players
- Initial rating window: ±100
- Expansion: 25 rating points per full minute waited
- Maximum rating window: ±500

Candidate selection is anchored by queue order and requires mutual compatibility before a player can be included in a match candidate set. Selected players are then balanced by aggregate rating.

These defaults are application policy rather than final competitive tuning. Live telemetry should be used before permanently locking rating thresholds.
