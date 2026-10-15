import { createHash, randomBytes } from "node:crypto";

export interface ResetRecord { userId: string; tokenHash: string; expiresAt: number; usedAt: number | null; }
export interface ResetStore {
  invalidateAllForUser(userId: string): Promise<void>;
  insert(rec: ResetRecord): Promise<void>;
  findByHash(tokenHash: string): Promise<ResetRecord | null>;
  markUsedIfUnused(tokenHash: string, nowMs: number): Promise<boolean>;
}
export class ResetError extends Error {
  constructor() { super("invalid or expired reset token"); this.name = "ResetError"; }
}
const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

export async function createResetToken(userId: string, store: ResetStore, opts: { ttlSec?: number; nowMs?: number } = {}): Promise<string> {
  const now = opts.nowMs ?? Date.now();
  const ttl = opts.ttlSec ?? 3600;
  if (!Number.isInteger(ttl) || ttl <= 0) throw new RangeError("ttlSec must be a positive integer");
  const token = randomBytes(32).toString("base64url");
  await store.invalidateAllForUser(userId);
  await store.insert({ userId, tokenHash: sha256(token), expiresAt: now + ttl * 1000, usedAt: null });
  return token;
}

export async function consumeResetToken(token: string, store: ResetStore, nowMs: number = Date.now()): Promise<{ userId: string }> {
  if (typeof token !== "string" || !/^[A-Za-z0-9_-]{43}$/.test(token)) throw new ResetError();
  const hash = sha256(token);
  const rec = await store.findByHash(hash);
  if (!rec || rec.usedAt !== null || nowMs >= rec.expiresAt) throw new ResetError();
  const won = await store.markUsedIfUnused(hash, nowMs);
  if (!won) throw new ResetError();
  return { userId: rec.userId };
}
