import type { ServerAssignment } from "./server-assignment";
import type { ServerProvisionRequest, ServerProvisioner } from "./server-provisioning";

/**
 * Represents a match played on an external platform such as XPLAY.
 * No external account is automated or scraped: the RIO ESPORTS platform only
 * records that players must organize the approved match manually.
 */
export type ExternalMatchProvisionerOptions = {
  provider: string;
  instructions?: string;
};

export class ExternalMatchProvisioner implements ServerProvisioner {
  constructor(private readonly options: ExternalMatchProvisionerOptions) {}

  async provision(request: ServerProvisionRequest): Promise<ServerAssignment> {
    if (!request.matchId) {
      throw new Error("External matches require a match identifier");
    }

    return {
      matchId: request.matchId,
      status: "ready",
      endpoint: undefined,
      metadata: {
        provider: this.options.provider,
        mode: "external_manual",
        region: request.region,
        instructions:
          this.options.instructions ??
          "Organize the approved external match manually, then submit a demo or confirmed result to RIO ESPORTS.",
      },
    };
  }

  async release(_matchId: string): Promise<void> {
    // External platforms own their infrastructure; there is no server resource
    // for RIO ESPORTS to terminate.
  }
}
