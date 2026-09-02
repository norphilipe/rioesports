export type IdempotencyRecord = {
  key: string;
  matchId: string;
  status: "processing" | "completed" | "failed";
};

export function createMatchIdempotencyKey(matchId: string, operation = "result") {
  if (!matchId) throw new Error("A match id is required for idempotency");
  return `competitive:${operation}:${matchId}`;
}

export function canReuseIdempotencyRecord(record: IdempotencyRecord) {
  return record.status === "failed";
}

export function isDuplicateCompletedOperation(record: IdempotencyRecord) {
  return record.status === "completed";
}
