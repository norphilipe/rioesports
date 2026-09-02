export type CompetitiveOperationStatus = "pending" | "completed" | "failed";

export type CompetitiveOperationRecord<T = unknown> = {
  key: string;
  status: CompetitiveOperationStatus;
  result?: T;
  error?: string;
  createdAt: string;
  updatedAt: string;
};

export interface CompetitiveOperationStore {
  find<T = unknown>(key: string): Promise<CompetitiveOperationRecord<T> | null>;
  create<T = unknown>(record: CompetitiveOperationRecord<T>): Promise<CompetitiveOperationRecord<T>>;
  update<T = unknown>(record: CompetitiveOperationRecord<T>): Promise<CompetitiveOperationRecord<T>>;
}

export function createPendingCompetitiveOperation(key: string, now = new Date()): CompetitiveOperationRecord {
  const timestamp = now.toISOString();
  return { key, status: "pending", createdAt: timestamp, updatedAt: timestamp };
}

export async function beginCompetitiveOperation<T>(
  store: CompetitiveOperationStore,
  key: string,
): Promise<CompetitiveOperationRecord<T>> {
  const existing = await store.find<T>(key);
  if (existing) return existing;
  return store.create(createPendingCompetitiveOperation(key) as CompetitiveOperationRecord<T>);
}

export async function completeCompetitiveOperation<T>(
  store: CompetitiveOperationStore,
  record: CompetitiveOperationRecord<T>,
  result: T,
  now = new Date(),
) {
  return store.update({ ...record, status: "completed", result, error: undefined, updatedAt: now.toISOString() });
}

export async function failCompetitiveOperation<T>(
  store: CompetitiveOperationStore,
  record: CompetitiveOperationRecord<T>,
  error: unknown,
  now = new Date(),
) {
  return store.update({
    ...record,
    status: "failed",
    error: error instanceof Error ? error.message : String(error),
    updatedAt: now.toISOString(),
  });
}
