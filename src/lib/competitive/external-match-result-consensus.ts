import {
  externalMatchResultsAgree,
  type ExternalMatchResultSubmission,
} from "./external-match-result-submission";

export type ExternalMatchResultConsensus =
  | { status: "pending" }
  | { status: "confirmed"; result: ExternalMatchResultSubmission }
  | { status: "conflict" };

export function resolveExternalMatchResultConsensus(
  submissions: ExternalMatchResultSubmission[],
): ExternalMatchResultConsensus {
  if (submissions.length < 2) return { status: "pending" };

  const [first, ...rest] = submissions;
  const agreement = rest.some((submission) =>
    submission.submittedBy !== first.submittedBy &&
    externalMatchResultsAgree(first, submission),
  );

  if (agreement) return { status: "confirmed", result: first };

  return { status: "conflict" };
}
