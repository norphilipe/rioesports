export type CompetitiveHealth = {
  identity: boolean;
  queue: boolean;
  matchFormation: boolean;
  serverLifecycle: boolean;
  results: boolean;
  rating: boolean;
};

export function competitiveHealthScore(health: CompetitiveHealth) {
  const values = Object.values(health);
  return values.filter(Boolean).length / values.length;
}
