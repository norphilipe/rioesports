export type ExternalMatchRoomState = "pending" | "ready" | "in_progress" | "awaiting_result" | "completed" | "disputed";

const transitions: Record<ExternalMatchRoomState, ExternalMatchRoomState[]> = {
  pending: ["ready"],
  ready: ["in_progress"],
  in_progress: ["awaiting_result"],
  awaiting_result: ["completed", "disputed"],
  disputed: ["awaiting_result", "completed"],
  completed: [],
};

export function assertExternalMatchRoomTransition(
  from: ExternalMatchRoomState,
  to: ExternalMatchRoomState,
) {
  if (!transitions[from].includes(to)) {
    throw new Error(`Invalid external match room transition: ${from} -> ${to}`);
  }
}

export function getExternalMatchRoomActions(state: ExternalMatchRoomState) {
  return transitions[state];
}
