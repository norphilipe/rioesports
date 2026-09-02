import type { MatchProcessingState } from "./match-processing";

export type MatchProcessingEvent = {
  matchId: string;
  previousState: MatchProcessingState;
  nextState: MatchProcessingState;
  occurredAt: string;
  attempt: number;
  reason?: string;
};

export function createMatchProcessingEvent(
  event: MatchProcessingEvent,
): MatchProcessingEvent {
  if (event.previousState === "completed") {
    throw new Error("Completed matches cannot transition again");
  }

  return event;
}
