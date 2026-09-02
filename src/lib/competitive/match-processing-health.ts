export type MatchProcessingHealth = {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  deadLettered: number;
};

export type MatchProcessingHealthStatus = "healthy" | "degraded" | "critical";

export function getMatchProcessingHealthStatus(
  health: MatchProcessingHealth,
): MatchProcessingHealthStatus {
  if (health.deadLettered > 0) return "critical";
  if (health.failed > 0 || health.processing > health.pending + health.completed) {
    return "degraded";
  }
  return "healthy";
}

export function totalObservedMatches(health: MatchProcessingHealth) {
  return health.pending + health.processing + health.completed + health.failed + health.deadLettered;
}
