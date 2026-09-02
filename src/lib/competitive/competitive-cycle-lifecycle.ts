export type CompetitiveMatchLifecycleState =
  | "queued"
  | "forming"
  | "server_provisioning"
  | "server_ready"
  | "in_progress"
  | "processing_result"
  | "completed"
  | "failed";

const transitions: Record<CompetitiveMatchLifecycleState, CompetitiveMatchLifecycleState[]> = {
  queued: ["forming", "failed"],
  forming: ["server_provisioning", "failed"],
  server_provisioning: ["server_ready", "failed"],
  server_ready: ["in_progress", "failed"],
  in_progress: ["processing_result", "failed"],
  processing_result: ["completed", "failed"],
  completed: [],
  failed: [],
};

export function canTransitionCompetitiveMatch(
  from: CompetitiveMatchLifecycleState,
  to: CompetitiveMatchLifecycleState,
) {
  return transitions[from].includes(to);
}

export function assertCompetitiveMatchTransition(
  from: CompetitiveMatchLifecycleState,
  to: CompetitiveMatchLifecycleState,
) {
  if (!canTransitionCompetitiveMatch(from, to)) {
    throw new Error(`Invalid competitive match transition: ${from} -> ${to}`);
  }
}
