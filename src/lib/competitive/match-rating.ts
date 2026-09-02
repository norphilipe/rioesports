import { averageRating, expectedScore } from "./rating-expectation";
import { calculateRatingDelta } from "./rating";

export type MatchRatedPlayer = {
  playerId: string;
  rating: number;
  team: "team_a" | "team_b";
};

export type MatchRatingChange = {
  playerId: string;
  before: number;
  delta: number;
  after: number;
};

export function calculateMatchRatingChanges(
  players: MatchRatedPlayer[],
  winner: "team_a" | "team_b",
) {
  const teamA = players.filter((player) => player.team === "team_a");
  const teamB = players.filter((player) => player.team === "team_b");

  if (teamA.length === 0 || teamB.length === 0) {
    throw new Error("Both teams require at least one player");
  }

  const averageA = averageRating(teamA.map((player) => player.rating));
  const averageB = averageRating(teamB.map((player) => player.rating));

  return players.map((player): MatchRatingChange => {
    const opponentAverage = player.team === "team_a" ? averageB : averageA;
    const expected = expectedScore(player.rating, opponentAverage);
    const actual = player.team === winner ? 1 : 0;
    const delta = calculateRatingDelta({
      rating: player.rating,
      expectedScore: expected,
      actualScore: actual,
    });

    return {
      playerId: player.playerId,
      before: player.rating,
      delta,
      after: player.rating + delta,
    };
  });
}
