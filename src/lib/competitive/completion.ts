export const COMPETITIVE_MVP_COMPLETION_TARGET = 100;

export function remainingCompetitiveWork(percentComplete: number) {
  return Math.max(0, COMPETITIVE_MVP_COMPLETION_TARGET - percentComplete);
}
