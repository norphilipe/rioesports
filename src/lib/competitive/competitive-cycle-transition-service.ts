import { assertCompetitiveMatchTransition, type CompetitiveMatchLifecycleState } from "./competitive-cycle-lifecycle";
import { persistCompetitiveCycleTransition, type CompetitiveCycleStore } from "./competitive-cycle-persistence";

export async function transitionCompetitiveMatch(
  store: CompetitiveCycleStore,
  matchId: string,
  from: CompetitiveMatchLifecycleState,
  to: CompetitiveMatchLifecycleState,
  now = new Date(),
) {
  assertCompetitiveMatchTransition(from, to);
  await persistCompetitiveCycleTransition(store, matchId, from, to, now);

  return {
    matchId,
    from,
    to,
    occurredAt: now.toISOString(),
  };
}
