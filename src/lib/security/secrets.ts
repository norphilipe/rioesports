import { timingSafeEqual } from "crypto";

export function safeSecretEqual(expected: string, received: string | null): boolean {
  if (!received || expected.length !== received.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(received));
}
