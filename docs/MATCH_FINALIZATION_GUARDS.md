# Match Finalization Guards

Competitive match finalization must be protected against invalid input and duplicate processing.

## Required validation

- A result must contain a match identifier, source, and timestamp.
- Both competitive teams must contain at least one player.
- A player may appear only once in a finalization payload.
- Ratings must be finite non-negative values.

## Idempotency

A completed match must not be finalized twice. Production persistence should enforce this at the database transaction boundary so retries cannot apply rating changes more than once.

These guards prepare the application layer for the next step: a single transactional database operation that records the result and rating history together.
