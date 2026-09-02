# Match Processing Orchestration

The trusted processing flow follows a controlled sequence:

1. Check retry eligibility when recovering from failure.
2. Atomically claim the match.
3. Process the validated competitive result.
4. Finalize the processing state only after successful execution.
5. Record a controlled failure when processing throws.

The orchestrator is provider-independent so the same lifecycle can later run in a dedicated worker, scheduled runtime, or containerized service.
