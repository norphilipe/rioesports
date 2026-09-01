export type CompetitiveProvider = "steam" | "faceit" | "leetify";
export type CompetitiveIdentityStatus = "pending" | "verified" | "blocked" | "revoked";
export type RsiConfidenceLevel = "low" | "medium" | "high";

export type CompetitiveIdentity = {
  provider: CompetitiveProvider;
  external_id: string;
  external_username: string | null;
  status: CompetitiveIdentityStatus;
  data_available: boolean;
  verified_at: string | null;
  last_verified_at: string | null;
};

export type PlayerCompetitiveState = {
  rsi: number;
  confidence_score: number;
  confidence_level: RsiConfidenceLevel;
  faceit_ban_detected: boolean;
  competitive_lock_reason: string | null;
  calculated_at: string | null;
};

export const CONFIDENCE_COPY: Record<RsiConfidenceLevel, {
  label: string;
  description: string;
}> = {
  low: {
    label: "Baixa",
    description: "Sua identidade Steam está sendo usada como base competitiva.",
  },
  medium: {
    label: "Média",
    description: "Steam e FACEIT fornecem uma base competitiva mais confiável.",
  },
  high: {
    label: "Alta",
    description: "Steam, FACEIT e Leetify fornecem a base de dados mais completa disponível.",
  },
};

export function isVerifiedAndUsable(
  identity: Pick<CompetitiveIdentity, "status" | "data_available"> | undefined,
) {
  return identity?.status === "verified" && identity.data_available;
}
