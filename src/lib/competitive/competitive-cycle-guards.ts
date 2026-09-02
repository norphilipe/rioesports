export function assertCompetitiveRegion(region: string) {
  if (!region || !region.trim()) {
    throw new Error("Competitive server region is required");
  }
}

export function assertDistinctTeams(teamAIds: string[], teamBIds: string[]) {
  const participants = [...teamAIds, ...teamBIds];

  if (participants.length !== 10) {
    throw new Error("Competitive matches require exactly 10 participants");
  }

  if (new Set(participants).size !== participants.length) {
    throw new Error("Competitive teams cannot contain duplicate participants");
  }
}
