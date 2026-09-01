export type RatingDeltaInput = {
  rating: number;
  expectedScore: number;
  actualScore: number;
  kFactor?: number;
};

export function calculateRatingDelta({
  rating,
  expectedScore,
  actualScore,
  kFactor = 32,
}: RatingDeltaInput) {
  if (!Number.isFinite(rating) || !Number.isFinite(expectedScore) || !Number.isFinite(actualScore)) {
    throw new Error("Invalid rating input");
  }

  return Math.round(kFactor * (actualScore - expectedScore));
}
