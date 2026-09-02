export type CompetitiveCycleFailureStage =
  | "matchmaking"
  | "match_creation"
  | "server_provisioning";

export type CompetitiveCycleFailure = {
  stage: CompetitiveCycleFailureStage;
  message: string;
};

export function toCompetitiveCycleFailure(
  stage: CompetitiveCycleFailureStage,
  error: unknown,
): CompetitiveCycleFailure {
  return {
    stage,
    message: error instanceof Error ? error.message : "unknown_competitive_cycle_error",
  };
}
