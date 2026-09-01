export type ReleaseReadiness = {
  queue: boolean;
  worker: boolean;
  server: boolean;
  results: boolean;
  rating: boolean;
};

export function isCompetitiveMvpReady(readiness: ReleaseReadiness) {
  return Object.values(readiness).every(Boolean);
}

export function missingCompetitiveReadiness(readiness: ReleaseReadiness) {
  return Object.entries(readiness)
    .filter(([, ready]) => !ready)
    .map(([area]) => area);
}
