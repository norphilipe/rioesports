import {
  calculateMatchRatingChanges,
  type MatchRatingParticipant,
} from "./rating-engine";

export type MatchCompletion = {
  matchId: string;
  gameId: string;
  winnerTeamSide: "team_a" | "team_b";
  participants: MatchRatingParticipant[];
};

export function buildMatchCompletionRatingChanges(completion: MatchCompletion) {
  return calculateMatchRatingChanges(
    completion.participants,
    completion.winnerTeamSide,
  );
}
