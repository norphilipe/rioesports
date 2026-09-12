function hexToBytes(value: string) {
  if (!/^[0-9a-f]{64}$/i.test(value)) return null;
  const bytes = new Uint8Array(32);
  for (let index = 0; index < 32; index += 1) bytes[index] = Number.parseInt(value.slice(index * 2, index * 2 + 2), 16);
  return bytes;
}

export async function verifyDiscordInteractionSignature(body: string, signature: string | null, timestamp: string | null, publicKey: string) {
  if (!signature || !timestamp) return false;
  const keyBytes = hexToBytes(publicKey);
  if (!keyBytes || !/^[0-9a-f]{128}$/i.test(signature)) return false;

  const signatureBytes = new Uint8Array(64);
  for (let index = 0; index < 64; index += 1) signatureBytes[index] = Number.parseInt(signature.slice(index * 2, index * 2 + 2), 16);

  try {
    const key = await crypto.subtle.importKey("raw", keyBytes, { name: "Ed25519" }, false, ["verify"]);
    const message = new TextEncoder().encode(`${timestamp}${body}`);
    return await crypto.subtle.verify("Ed25519", key, signatureBytes, message);
  } catch {
    return false;
  }
}
