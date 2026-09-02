# Match Processing Reconciliation

A completed competitive match must satisfy all of the following invariants:

- A trusted result was recorded.
- Rating updates were applied.
- Processing state is consistent with those records.

The reconciliation layer provides a backend-safe way to identify partial failures that may occur across database and worker boundaries. Inconsistent matches must be investigated or recovered through trusted execution rather than automatically replayed without idempotency checks.
