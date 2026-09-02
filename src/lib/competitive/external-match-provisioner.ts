import type { ServerAssignment } from "./server-assignment";
import type { ServerProvisionRequest, ServerProvisioner } from "./server-provisioning";

/**
 * Represents a match played on an external platform such as XPLAY.
 * No external account is automated or scraped: RIO ESPORTS only records that
 * players must organize the approved match manually.
 */
export type ExternalMatchProvisionerOptions = {
  provider: string;
};

export class ExternalMatchProvisioner implements ServerProvisioner {
  constructor(private readonly options: ExternalMatchProvisionerOptions) {}

  async provision(request: ServerProvisionRequest): Promise<ServerAssignment> {
    if (!request.matchId) {
      throw new Error("External matches require a match identifier");
    }

    // `ready` is intentionally avoided here: a ServerAssignment represents a
    // concrete connection endpoint, which external manual matches do not have.
    // The match lifecycle can continue through result verification instead.
    return {
      matchId: request.matchId,
      status: "unassigned",
      endpoint: null,
    };
  }

  async release(_matchId: string): Promise<void> {
    // External platforms own their infrastructure; there is no server resource
    // for RIO ESPORTS to terminate.
  }

  get provider() {
    return this.options.provider;
  }
}
