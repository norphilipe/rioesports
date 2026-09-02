export type CompetitiveCycleCompensation = {
  action: "release_server" | "mark_failed" | "none";
  reason: string;
};

export function determineCompetitiveCompensation(input: {
  matchId?: string | null;
  serverAssigned?: boolean;
  processingStarted?: boolean;
}): CompetitiveCycleCompensation {
  if (input.serverAssigned && input.matchId) {
    return { action: "release_server", reason: "server_assigned_before_cycle_failure" };
  }

  if (input.matchId) {
    return { action: "mark_failed", reason: "match_created_before_cycle_failure" };
  }

  return { action: "none", reason: "no_resources_created" };
}
