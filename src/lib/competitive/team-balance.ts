export type RatedPlayer = {
  id: string;
  rating: number;
};

export type BalancedTeams = {
  teamA: RatedPlayer[];
  teamB: RatedPlayer[];
  ratingDifference: number;
};

export function balanceTeams(players: RatedPlayer[]): BalancedTeams {
  if (players.length === 0 || players.length % 2 !== 0) {
    throw new Error("An even number of players is required to balance teams");
  }

  const sorted = [...players].sort((a, b) => b.rating - a.rating);
  const teamA: RatedPlayer[] = [];
  const teamB: RatedPlayer[] = [];
  let ratingA = 0;
  let ratingB = 0;

  for (const player of sorted) {
    if (ratingA <= ratingB) {
      teamA.push(player);
      ratingA += player.rating;
    } else {
      teamB.push(player);
      ratingB += player.rating;
    }
  }

  return {
    teamA,
    teamB,
    ratingDifference: Math.abs(ratingA - ratingB),
  };
}
