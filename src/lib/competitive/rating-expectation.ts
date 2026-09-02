export function expectedScore(playerRating: number, opponentRating: number) {
  if (!Number.isFinite(playerRating) || !Number.isFinite(opponentRating)) {
    throw new Error("Ratings must be finite numbers");
  }

  return 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
}

export function averageRating(ratings: number[]) {
  if (ratings.length === 0) {
    throw new Error("At least one rating is required");
  }

  return ratings.reduce((total, rating) => total + rating, 0) / ratings.length;
}
