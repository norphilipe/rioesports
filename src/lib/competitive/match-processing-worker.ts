export type MatchProcessingRpcClient = {
  rpc: (name: string, args: Record<string, string>) => Promise<{
    data: boolean | null;
    error: { message: string } | null;
  }>;
};

export async function claimCompetitiveMatchProcessing(
  client: MatchProcessingRpcClient,
  matchId: string,
) {
  const { data, error } = await client.rpc(
    "claim_competitive_match_processing",
    { p_match_id: matchId },
  );

  if (error) {
    throw new Error(error.message);
  }

  return data === true;
}
