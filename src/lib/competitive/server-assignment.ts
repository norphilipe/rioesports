export type ServerAssignment = {
  matchId: string;
  status: "unassigned" | "provisioning" | "ready" | "failed" | "released";
  endpoint: string | null;
};

export function canConnectToServer(assignment: ServerAssignment) {
  return assignment.status === "ready" && Boolean(assignment.endpoint);
}
