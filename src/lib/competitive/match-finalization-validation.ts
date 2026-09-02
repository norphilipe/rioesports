import type { CompetitiveMatchResult } from "./result";
import type { MatchRatedPlayer } from "./match-rating";

export function validateMatchFinalization(
  result: CompetitiveMatchResult,
  players: MatchRatedPlayer[],
) {
  if (!result.matchId || !result.source || !result.recordedAt) {
    throw new Error("Incomplete match result");
  }

  if (players.length < 2) {
    throw new Error("A finalized match requires at least two players");
  }

  const uniquePlayers = new Set(players.map((player) => player.playerId));
  if (uniquePlayers.size !== players.length) {
    throw new Error("A player cannot appear more than once in a finalized match");
  }

  const teamA = players.filter((player) => player.team === "team_a");
  const teamB = players.filter((player) => player.team === "team_b");

  if (teamA.length === 0 || teamB.length === 0) {
    throw new Error("Both teams must be represented in a finalized match");
  }

  for (const player of players) {
    if (!Number.isFinite(player.rating) || player.rating < 0) {
      throw new Error("Player ratings must be finite non-negative numbers");
    }
  }
}
