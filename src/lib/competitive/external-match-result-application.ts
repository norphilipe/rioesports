export type ExternalMatchResultApplicationInput = {
  matchId: string;
  resultVerified: boolean;
  ratingApplied: boolean;
  alreadyApplied?: boolean;
};

export type ExternalMatchResultApplicationState =
  | "blocked"
  | "ready"
  | "already_applied";

/**
 * Defines the final idempotency boundary for external competitive results.
 * Persistence implementations should only transition a result to applied when
 * the verified result and all rating writes belong to the same successful unit
 * of work.
 */
export function getExternalMatchResultApplicationState(
  input: ExternalMatchResultApplicationInput,
): ExternalMatchResultApplicationState {
  if (input.alreadyApplied) return "already_applied";

  if (!input.matchId || !input.resultVerified || !input.ratingApplied) {
    return "blocked";
  }

  return "ready";
}

export function assertExternalMatchResultReadyForFinalization(
  input: ExternalMatchResultApplicationInput,
) {
  const state = getExternalMatchResultApplicationState(input);

  if (state === "blocked") {
    throw new Error(
      "External match result cannot be finalized before verification and rating application",
    );
  }

  return state;
}
