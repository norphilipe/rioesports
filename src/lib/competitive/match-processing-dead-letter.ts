export type DeadLetterMatch = {
  matchId: string;
  attemptCount: number;
  reason: string;
};

export function shouldDeadLetterMatch(
  attemptCount: number,
  maxAttempts = 5,
) {
  return attemptCount >= maxAttempts;
}

export function createDeadLetterMatch(
  matchId: string,
  attemptCount: number,
  reason: string,
): DeadLetterMatch {
  if (!shouldDeadLetterMatch(attemptCount)) {
    throw new Error("Match has not exhausted its processing attempts");
  }

  return { matchId, attemptCount, reason };
}
