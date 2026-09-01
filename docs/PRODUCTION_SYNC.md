# Production Schema Synchronization

Production received additive migrations during recovery from historical migration drift. The canonical repository migrations must remain the source of truth for future environments.

## Reconciliation approach

- Historical migrations are preserved for reproducibility.
- New migrations reconcile production-specific additive changes.
- Matchmaking operations are represented explicitly in migrations 009 and 010.
- Competitive identity production structures are reconciled in migrations 014 and 015.

Before creating a new environment, validate the complete migration chain against a clean database.
