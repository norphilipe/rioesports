import type { ServerAssignment } from "./server-assignment";

export type ServerProvisionRequest = {
  matchId: string;
  region: string;
};

export type ServerProvisioner = {
  provision(request: ServerProvisionRequest): Promise<ServerAssignment>;
  release(matchId: string): Promise<void>;
};

export function validateServerAssignment(assignment: ServerAssignment) {
  if (assignment.status === "ready" && !assignment.endpoint) {
    throw new Error("Ready servers must provide a connection endpoint");
  }
}
