export type ProcessableMatchResult = {
  matchId: string;
  winnerTeamSide: "team_a" | "team_b";
  source: string;
};

export type RatingParticipant = {
  playerId: string;
  rating: number;
  teamSide: "team_a" | "team_b";
};

export type MatchResultProcessor = {
  process(input: {
    result: ProcessableMatchResult;
    participants: RatingParticipant[];
  }): Promise<void>;
};

export function validateProcessableMatchResult(
  result: ProcessableMatchResult,
  participants: RatingParticipant[],
) {
  if (!result.matchId || !result.source) {
    throw new Error("Match result requires an identifier and source");
  }

  if (participants.length !== 10) {
    throw new Error("Competitive rating processing requires exactly 10 participants");
  }

  const playerIds = new Set(participants.map((participant) => participant.playerId));
  if (playerIds.size !== participants.length) {
    throw new Error("Duplicate players cannot be processed in a match result");
  }
}
