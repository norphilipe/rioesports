# Match Finalization Flow

The competitive completion path is now modeled as a single deterministic flow:

1. A trusted source records the match result.
2. The result identifies the winning team.
3. Participating players are grouped by team.
4. Team-average ratings establish expected outcomes.
5. Individual rating changes are calculated.
6. The finalization payload is validated before persistence.

Database persistence remains a separate trusted execution concern so application clients cannot directly finalize competitive matches or modify ratings.
