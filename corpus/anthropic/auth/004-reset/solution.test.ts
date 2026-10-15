import { test } from "node:test";
import assert from "node:assert/strict";
import { createResetToken, consumeResetToken, ResetError, type ResetStore, type ResetRecord } from "./solution.ts";

function memStore(): ResetStore & { rows: Map<string, ResetRecord> } {
  const rows = new Map<string, ResetRecord>();
  return {
    rows,
    async invalidateAllForUser(userId) { for (const [k, r] of rows) if (r.userId === userId) rows.delete(k); },
    async insert(rec) { rows.set(rec.tokenHash, { ...rec }); },
    async findByHash(h) { await Promise.resolve(); const r = rows.get(h); return r ? { ...r } : null; },
    async markUsedIfUnused(h, now) {
      await Promise.resolve();
      const r = rows.get(h);
      if (!r || r.usedAt !== null) return false;
      r.usedAt = now; return true;
    },
  };
}
const T0 = 1_700_000_000_000;

test("token works once, returns the user id", async () => {
  const s = memStore();
  const tok = await createResetToken("u1", s, { nowMs: T0 });
  assert.deepEqual(await consumeResetToken(tok, s, T0 + 1000), { userId: "u1" });
  await assert.rejects(() => consumeResetToken(tok, s, T0 + 2000), ResetError);
});
test("raw token is never stored, only its hash", async () => {
  const s = memStore();
  const tok = await createResetToken("u1", s, { nowMs: T0 });
  assert.ok(!JSON.stringify([...s.rows.entries()]).includes(tok));
  assert.equal([...s.rows.keys()][0].length, 64);
});
test("tokens are unique and high entropy", async () => {
  const s = memStore();
  const set = new Set<string>();
  for (let i = 0; i < 50; i++) set.add(await createResetToken(`u${i}`, s));
  assert.equal(set.size, 50);
  for (const t of set) assert.equal(t.length, 43);
});
test("expires at exactly ttl", async () => {
  const s = memStore();
  const tok = await createResetToken("u1", s, { ttlSec: 600, nowMs: T0 });
  await assert.rejects(() => consumeResetToken(tok, s, T0 + 600_000), ResetError);
  const tok2 = await createResetToken("u1", s, { ttlSec: 600, nowMs: T0 });
  assert.deepEqual(await consumeResetToken(tok2, s, T0 + 599_999), { userId: "u1" });
});
test("expired attempt does not burn the token record state", async () => {
  const s = memStore();
  const tok = await createResetToken("u1", s, { ttlSec: 60, nowMs: T0 });
  await assert.rejects(() => consumeResetToken(tok, s, T0 + 120_000), ResetError);
  assert.equal([...s.rows.values()][0].usedAt, null);
});
test("requesting a new token invalidates the previous one", async () => {
  const s = memStore();
  const old = await createResetToken("u1", s, { nowMs: T0 });
  const fresh = await createResetToken("u1", s, { nowMs: T0 + 1000 });
  await assert.rejects(() => consumeResetToken(old, s, T0 + 2000), ResetError);
  assert.deepEqual(await consumeResetToken(fresh, s, T0 + 2000), { userId: "u1" });
});
test("invalidation is per user only", async () => {
  const s = memStore();
  const a = await createResetToken("alice", s, { nowMs: T0 });
  await createResetToken("bob", s, { nowMs: T0 });
  assert.deepEqual(await consumeResetToken(a, s, T0 + 1), { userId: "alice" });
});
test("10 concurrent consumes: exactly one succeeds", async () => {
  const s = memStore();
  const tok = await createResetToken("u1", s, { nowMs: T0 });
  const results = await Promise.allSettled(Array.from({ length: 10 }, () => consumeResetToken(tok, s, T0 + 5)));
  assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
  assert.equal(results.filter((r) => r.status === "rejected").length, 9);
});
test("every failure mode gives the identical error (no oracle)", async () => {
  const s = memStore();
  const used = await createResetToken("u1", s, { nowMs: T0 });
  await consumeResetToken(used, s, T0 + 1);
  const expired = await createResetToken("u2", s, { ttlSec: 1, nowMs: T0 });
  const messages = new Set<string>();
  const attempts = ["", "short", "x".repeat(43), used, expired, undefined as never];
  for (const a of attempts) {
    try { await consumeResetToken(a, s, T0 + 60_000); assert.fail("should reject"); }
    catch (e) { assert.ok(e instanceof ResetError); messages.add((e as Error).message); }
  }
  assert.equal(messages.size, 1);
});
test("invalid ttl rejected", async () => {
  await assert.rejects(() => createResetToken("u1", memStore(), { ttlSec: 0 }), RangeError);
});
