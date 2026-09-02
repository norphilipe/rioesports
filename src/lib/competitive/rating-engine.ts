export type MatchRatingParticipant = {
  profileId: string;
  mmr: number;
  teamSide: "team_a" | "team_b";
};

export type MatchRatingChange = {
  profileId: string;
  previousMmr: number;
  newMmr: number;
  change: number;
};

function average(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function expectedTeamScore(ownAverage: number, opponentAverage: number) {
  return 1 / (1 + 10 ** ((opponentAverage - ownAverage) / 400));
}

export function calculateMatchRatingChanges(
  participants: MatchRatingParticipant[],
  winner: "team_a" | "team_b",
  kFactor = 32,
): MatchRatingChange[] {
  const teamA = participants.filter((player) => player.teamSide === "team_a");
  const teamB = participants.filter((player) => player.teamSide === "team_b");

  if (!teamA.length || !teamB.length) {
    throw new Error("Both teams must contain at least one player");
  }

  const averageA = average(teamA.map((player) => player.mmr));
  const averageB = average(teamB.map((player) => player.mmr));
  const expectedA = expectedTeamScore(averageA, averageB);
  const expectedB = expectedTeamScore(averageB, averageA);

  return participants.map((player) => {
    const expected = player.teamSide === "team_a" ? expectedA : expectedB;
    const actual = player.teamSide === winner ? 1 : 0;
    const change = Math.round(kFactor * (actual - expected));

    return {
      profileId: player.profileId,
      previousMmr: player.mmr,
      newMmr: Math.max(0, player.mmr + change),
      change,
    };
  });
}
