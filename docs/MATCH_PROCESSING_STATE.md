# Match Processing State

Competitive match processing uses an explicit state boundary:

- `pending`: no trusted processing has started.
- `processing`: a worker has claimed the match.
- `completed`: results and rating changes were successfully finalized.
- `failed`: processing ended without successful completion and requires controlled retry handling.

A completed match must never be processed again. Retry logic must operate only through trusted backend execution and preserve idempotency guarantees.
