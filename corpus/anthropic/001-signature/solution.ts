import { createHmac, timingSafeEqual } from "node:crypto";

export class SignatureError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SignatureError";
  }
}

export function verifyStripeSignature(
  rawBody: string,
  header: string | undefined | null,
  secret: string,
  toleranceSec = 300,
  nowSec = Math.floor(Date.now() / 1000),
): void {
  if (!header) throw new SignatureError("missing signature header");

  let timestamp: number | null = null;
  const v1: string[] = [];
  for (const part of header.split(",")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (key === "t") {
      const n = Number(value);
      if (Number.isInteger(n) && n > 0) timestamp = n;
    } else if (key === "v1") {
      v1.push(value);
    }
  }

  if (timestamp === null) throw new SignatureError("invalid timestamp");
  if (v1.length === 0) throw new SignatureError("no v1 signature");
  if (Math.abs(nowSec - timestamp) > toleranceSec) {
    throw new SignatureError("timestamp outside tolerance");
  }

  const expected = createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody}`, "utf8")
    .digest();

  const ok = v1.some((sig) => {
    if (!/^[0-9a-f]{64}$/i.test(sig)) return false;
    return timingSafeEqual(expected, Buffer.from(sig, "hex"));
  });
  if (!ok) throw new SignatureError("signature mismatch");
}
