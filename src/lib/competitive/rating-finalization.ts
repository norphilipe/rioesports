import { calculateMatchRatingUpdate, type RatingUpdate } from "./rating-worker";

export type RatedMatchPlayer = {
  playerId: string;
  rating: number;
  teamSide: "team_a" | "team_b";
};

export type MatchRatingFinalization = {
  winnerTeamSide: "team_a" | "team_b";
  updates: RatingUpdate[];
};

function averageRating(players: RatedMatchPlayer[]) {
  if (!players.length) throw new Error("A team cannot be empty");
  return players.reduce((total, player) => total + player.rating, 0) / players.length;
}

function expectedScore(rating: number, opponentRating: number) {
  return 1 / (1 + 10 ** ((opponentRating - rating) / 400));
}

export function finalizeMatchRatings(
  players: RatedMatchPlayer[],
  winnerTeamSide: "team_a" | "team_b",
): MatchRatingFinalization {
  const teamA = players.filter((player) => player.teamSide === "team_a");
  const teamB = players.filter((player) => player.teamSide === "team_b");

  if (!teamA.length || !teamB.length) {
    throw new Error("Both teams must contain at least one player");
  }

  const teamARating = averageRating(teamA);
  const teamBRating = averageRating(teamB);

  const updates = players.map((player) => {
    const isTeamA = player.teamSide === "team_a";
    const opponentRating = isTeamA ? teamBRating : teamARating;
    const expected = expectedScore(player.rating, opponentRating);
    const actual = player.teamSide === winnerTeamSide ? 1 : 0;

    return calculateMatchRatingUpdate(player.playerId, player.rating, expected, actual);
  });

  return { winnerTeamSide, updates };
}
