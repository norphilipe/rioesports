import type { CompetitiveMatchResult } from "./result";
import { calculateMatchRatingChanges, type MatchRatedPlayer } from "./match-rating";

export type MatchFinalization = {
  result: CompetitiveMatchResult;
  ratingChanges: ReturnType<typeof calculateMatchRatingChanges>;
};

export function prepareMatchFinalization(
  result: CompetitiveMatchResult,
  players: MatchRatedPlayer[],
): MatchFinalization {
  return {
    result,
    ratingChanges: calculateMatchRatingChanges(players, result.winnerTeamSide),
  };
}
