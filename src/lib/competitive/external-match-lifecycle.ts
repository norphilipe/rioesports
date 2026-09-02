export type ExternalMatchLifecycleStatus =
  | "formed"
  | "awaiting_result"
  | "verified"
  | "rating_applied"
  | "finalized";

const transitions: Record<ExternalMatchLifecycleStatus, ExternalMatchLifecycleStatus[]> = {
  formed: ["awaiting_result"],
  awaiting_result: ["verified"],
  verified: ["rating_applied"],
  rating_applied: ["finalized"],
  finalized: [],
};

export function canTransitionExternalMatch(
  from: ExternalMatchLifecycleStatus,
  to: ExternalMatchLifecycleStatus,
) {
  return transitions[from].includes(to);
}

export function assertExternalMatchTransition(
  from: ExternalMatchLifecycleStatus,
  to: ExternalMatchLifecycleStatus,
) {
  if (!canTransitionExternalMatch(from, to)) {
    throw new Error(`Invalid external match lifecycle transition: ${from} -> ${to}`);
  }
}

export function getNextExternalMatchStatus(
  current: ExternalMatchLifecycleStatus,
): ExternalMatchLifecycleStatus | null {
  return transitions[current][0] ?? null;
}
