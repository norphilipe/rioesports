import { calculateRatingDelta } from "./rating";

export type RatingUpdate = {
  playerId: string;
  before: number;
  after: number;
  delta: number;
};

export function calculateMatchRatingUpdate(
  playerId: string,
  rating: number,
  expectedScore: number,
  actualScore: number,
): RatingUpdate {
  const delta = calculateRatingDelta({ rating, expectedScore, actualScore });
  return { playerId, before: rating, after: rating + delta, delta };
}
