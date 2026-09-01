import type { CompetitiveMatchResult } from "./result";

type ResultRpcClient = {
  rpc: (name: string, args: Record<string, string>) => Promise<{
    data: unknown;
    error: { message: string } | null;
  }>;
};

export async function recordCompetitiveMatchResult(
  client: ResultRpcClient,
  result: CompetitiveMatchResult,
) {
  const { error } = await client.rpc("record_competitive_match_result", {
    p_match_id: result.matchId,
    p_winner_team_side: result.winnerTeamSide,
    p_result_source: result.source,
  });

  if (error) {
    throw new Error(error.message);
  }
}
