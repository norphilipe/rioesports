import {
  beginCompetitiveOperation,
  completeCompetitiveOperation,
  failCompetitiveOperation,
  type CompetitiveOperationStore,
} from "./competitive-operation-store";

export type CompetitiveOperationExecution<T> = {
  key: string;
  status: "completed" | "reused";
  result: T;
};

export async function runCompetitiveOperation<T>(
  store: CompetitiveOperationStore,
  key: string,
  execute: () => Promise<T>,
): Promise<CompetitiveOperationExecution<T>> {
  const operation = await beginCompetitiveOperation<T>(store, key);

  if (operation.status === "completed") {
    return {
      key: operation.key,
      status: "reused",
      result: operation.result as T,
    };
  }

  try {
    const result = await execute();
    const completed = await completeCompetitiveOperation(store, operation, result);

    return {
      key: completed.key,
      status: "completed",
      result,
    };
  } catch (error) {
    await failCompetitiveOperation(store, operation, error);
    throw error;
  }
}
