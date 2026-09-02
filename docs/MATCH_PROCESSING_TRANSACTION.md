# Competitive Match Processing Transaction

A completed competitive match must be processed exactly once.

## Required sequence

1. Validate the result and all participants.
2. Claim the match processing identifier through the trusted database boundary.
3. Abort without rating changes if the match was already claimed.
4. Calculate team expectations and rating deltas.
5. Persist rating changes and history.
6. Mark processing as complete within the same trusted execution flow.

The idempotency claim protects against duplicate webhooks, worker retries, and repeated result submissions. A production implementation should execute the rating writes atomically with the processing state transition.
