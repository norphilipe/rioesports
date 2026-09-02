import type { CompetitiveMatchLifecycleState } from "./competitive-cycle-lifecycle";

export type CompetitiveCycleSummary = {
  matchId: string | null;
  state: CompetitiveMatchLifecycleState;
  serverReady: boolean;
  resultProcessed: boolean;
  ratingApplied: boolean;
};

export function isCompetitiveCycleComplete(summary: CompetitiveCycleSummary) {
  return (
    summary.state === "completed" &&
    summary.resultProcessed &&
    summary.ratingApplied
  );
}
