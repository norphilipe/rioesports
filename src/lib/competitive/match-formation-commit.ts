import type { MatchmakingCycleResult } from "./matchmaking-cycle";

export type MatchFormationStore = {
  createMatch(input: { teamAIds: string[]; teamBIds: string[] }): Promise<{ matchId: string }>;
};

export async function commitFormedMatch(
  store: MatchFormationStore,
  result: MatchmakingCycleResult,
) {
  if (!result.formed) return null;

  return store.createMatch({
    teamAIds: result.teamAIds,
    teamBIds: result.teamBIds,
  });
}
