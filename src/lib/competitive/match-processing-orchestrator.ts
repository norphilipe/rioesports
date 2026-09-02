import { canRetryMatchProcessing, type MatchProcessingRecovery } from "./match-processing-recovery";

export type MatchProcessingOrchestrator = {
  claim(matchId: string): Promise<boolean>;
  process(matchId: string): Promise<void>;
  markFailed(matchId: string, reason: string): Promise<void>;
  complete(matchId: string): Promise<void>;
};

export async function runMatchProcessing(
  worker: MatchProcessingOrchestrator,
  matchId: string,
  recovery?: MatchProcessingRecovery,
) {
  if (recovery && !canRetryMatchProcessing(recovery)) {
    return { processed: false, reason: "retry_not_ready" as const };
  }

  const claimed = await worker.claim(matchId);
  if (!claimed) {
    return { processed: false, reason: "already_claimed" as const };
  }

  try {
    await worker.process(matchId);
    await worker.complete(matchId);
    return { processed: true, reason: "completed" as const };
  } catch (error) {
    const reason = error instanceof Error ? error.message : "unknown_processing_error";
    await worker.markFailed(matchId, reason);
    throw error;
  }
}
