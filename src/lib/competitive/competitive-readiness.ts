export type CompetitiveReadiness = {
  queue: boolean;
  matchmaking: boolean;
  matchProcessing: boolean;
  resultIngestion: boolean;
  ratingPersistence: boolean;
  serverRuntime: boolean;
};

export function competitiveReadinessPercent(readiness: CompetitiveReadiness) {
  const values = Object.values(readiness);
  const ready = values.filter(Boolean).length;
  return Math.round((ready / values.length) * 100);
}

export function missingCompetitiveDependencies(readiness: CompetitiveReadiness) {
  return Object.entries(readiness)
    .filter(([, ready]) => !ready)
    .map(([dependency]) => dependency);
}
