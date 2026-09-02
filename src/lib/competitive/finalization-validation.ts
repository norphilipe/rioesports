import type { MatchFinalization } from "./match-finalization";

export function validateMatchFinalization(finalization: MatchFinalization) {
  if (!finalization.result.matchId) {
    throw new Error("Match result requires a match id");
  }

  if (finalization.ratingChanges.length === 0) {
    throw new Error("Match finalization requires rating changes");
  }

  const uniquePlayers = new Set(finalization.ratingChanges.map((change) => change.playerId));
  if (uniquePlayers.size !== finalization.ratingChanges.length) {
    throw new Error("A player can only receive one rating update per match");
  }

  return true;
}
