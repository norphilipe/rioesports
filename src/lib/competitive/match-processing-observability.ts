import type { MatchProcessingState } from "./match-processing";

export type MatchProcessingEventType =
  | "claimed"
  | "started"
  | "completed"
  | "failed"
  | "retry_scheduled";

export type MatchProcessingEvent = {
  matchId: string;
  previousState: MatchProcessingState;
  nextState: MatchProcessingState;
  occurredAt: string;
  attempt: number;
  reason?: string;
  type?: MatchProcessingEventType;
};

export function createMatchProcessingEvent(
  event: MatchProcessingEvent,
): MatchProcessingEvent {
  if (event.previousState === "completed") {
    throw new Error("Completed matches cannot transition again");
  }

  if (event.attempt < 1) {
    throw new Error("Match processing attempts must start at 1");
  }

  return event;
}
