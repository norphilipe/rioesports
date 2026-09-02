import type { CompetitiveMatchLifecycleState } from "./competitive-cycle-lifecycle";

export type CompetitiveCycleStore = {
  transition(input: {
    matchId: string;
    from: CompetitiveMatchLifecycleState;
    to: CompetitiveMatchLifecycleState;
    occurredAt: string;
  }): Promise<boolean>;
};

export async function persistCompetitiveCycleTransition(
  store: CompetitiveCycleStore,
  matchId: string,
  from: CompetitiveMatchLifecycleState,
  to: CompetitiveMatchLifecycleState,
  now = new Date(),
) {
  if (!matchId) throw new Error("A match id is required for lifecycle persistence");

  const persisted = await store.transition({
    matchId,
    from,
    to,
    occurredAt: now.toISOString(),
  });

  if (!persisted) {
    throw new Error(`Competitive lifecycle transition was rejected: ${from} -> ${to}`);
  }
}
