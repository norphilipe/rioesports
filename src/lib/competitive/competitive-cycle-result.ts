export type CompetitiveCycleResult<TMatchmaking, TDispatch> =
  | {
      ok: true;
      stage: "queue" | "server_ready";
      matchmaking: TMatchmaking;
      dispatch: TDispatch | null;
    }
  | {
      ok: false;
      stage: "failed";
      matchmaking: TMatchmaking | null;
      dispatch: null;
      failure: { stage: string; message: string };
    };
