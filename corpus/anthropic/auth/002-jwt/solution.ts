import { createHmac, timingSafeEqual } from "node:crypto";

export class JwtError extends Error {
  constructor(message: string) { super(message); this.name = "JwtError"; }
}
const B64URL = /^[A-Za-z0-9_-]+$/;
const MIN_SECRET_BYTES = 32;

function checkSecret(secret: string): void {
  if (typeof secret !== "string" || Buffer.byteLength(secret) < MIN_SECRET_BYTES) {
    throw new Error(`JWT secret must be at least ${MIN_SECRET_BYTES} bytes`);
  }
}
const enc = (obj: unknown) => Buffer.from(JSON.stringify(obj)).toString("base64url");
const mac = (data: string, secret: string) => createHmac("sha256", secret).update(data).digest();

export function signJwt(payload: Record<string, unknown>, secret: string, opts: { expiresInSec: number; nowSec?: number }): string {
  checkSecret(secret);
  if (!Number.isInteger(opts.expiresInSec) || opts.expiresInSec <= 0) throw new RangeError("expiresInSec must be a positive integer");
  const now = opts.nowSec ?? Math.floor(Date.now() / 1000);
  const body = { ...payload, iat: now, exp: now + opts.expiresInSec };
  const data = `${enc({ alg: "HS256", typ: "JWT" })}.${enc(body)}`;
  return `${data}.${mac(data, secret).toString("base64url")}`;
}

export interface VerifyOptions { nowSec?: number; clockSkewSec?: number; issuer?: string; audience?: string; }

export function verifyJwt(token: string, secret: string, opts: VerifyOptions = {}): Record<string, unknown> {
  checkSecret(secret);
  if (typeof token !== "string") throw new JwtError("malformed token");
  const parts = token.split(".");
  if (parts.length !== 3 || !parts.every((p) => B64URL.test(p))) throw new JwtError("malformed token");
  const [h, p, s] = parts;

  let header: unknown;
  try { header = JSON.parse(Buffer.from(h, "base64url").toString("utf8")); }
  catch { throw new JwtError("malformed token"); }
  if (!header || typeof header !== "object" || (header as { alg?: unknown }).alg !== "HS256") throw new JwtError("unsupported algorithm");

  const given = Buffer.from(s, "base64url");
  const expected = mac(`${h}.${p}`, secret);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) throw new JwtError("invalid signature");

  let claims: Record<string, unknown>;
  try { claims = JSON.parse(Buffer.from(p, "base64url").toString("utf8")); }
  catch { throw new JwtError("malformed token"); }
  if (!claims || typeof claims !== "object" || Array.isArray(claims)) throw new JwtError("malformed token");

  const now = opts.nowSec ?? Math.floor(Date.now() / 1000);
  const skew = opts.clockSkewSec ?? 0;

  if (typeof claims.exp !== "number") throw new JwtError("missing exp");
  if (now - skew >= claims.exp) throw new JwtError("token expired");
  if (claims.nbf !== undefined) {
    if (typeof claims.nbf !== "number") throw new JwtError("malformed token");
    if (now + skew < claims.nbf) throw new JwtError("token not yet valid");
  }
  if (opts.issuer !== undefined && claims.iss !== opts.issuer) throw new JwtError("bad issuer");
  if (opts.audience !== undefined) {
    const aud = claims.aud;
    const ok = Array.isArray(aud) ? aud.includes(opts.audience) : aud === opts.audience;
    if (!ok) throw new JwtError("bad audience");
  }
  return claims;
}
