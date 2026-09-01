export type CompetitiveMvpProgress = {
  architecture: number;
  applicationIntegration: number;
  infrastructure: number;
  validation: number;
};

export function estimateCompetitiveMvpProgress(progress: CompetitiveMvpProgress) {
  const values = Object.values(progress);
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}
