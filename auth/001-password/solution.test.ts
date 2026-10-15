import { test } from "node:test";
import assert from "node:assert/strict";
import { hashPassword, verifyPassword, needsRehash, DEFAULT_PARAMS } from "./solution.ts";
const FAST = { N: 1024, r: 8, p: 1 };

test("correct password verifies, wrong fails", async () => {
  const h = await hashPassword("correct horse battery", FAST);
  assert.equal(await verifyPassword("correct horse battery", h), true);
  assert.equal(await verifyPassword("correct horse batterY", h), false);
});
test("same password gives different hashes (random salt)", async () => {
  const a = await hashPassword("samePassword1", FAST);
  const b = await hashPassword("samePassword1", FAST);
  assert.notEqual(a, b);
});
test("stored format is self-describing and never contains the password", async () => {
  const h = await hashPassword("superSecret99", FAST);
  assert.match(h, /^scrypt\$1024\$8\$1\$[A-Za-z0-9+/=]+\$[A-Za-z0-9+/=]+$/);
  assert.ok(!h.includes("superSecret99"));
});
test("verify uses params embedded in the hash, not the current default", async () => {
  const h = await hashPassword("oldParamsPass1", FAST);
  assert.equal(await verifyPassword("oldParamsPass1", h), true);
});
test("unicode normalization: composed and decomposed forms match", async () => {
  const composed = "caf\u00e9-password";
  const decomposed = "cafe\u0301-password";
  const h = await hashPassword(composed, FAST);
  assert.equal(await verifyPassword(decomposed, h), true);
});
test("malformed or hostile stored values return false and never throw", async () => {
  const bad = [
    "", "garbage", "scrypt$1$1$1$a$b", "bcrypt$1024$8$1$AAAA$AAAA",
    "scrypt$1024$8$1$AAAAAAAAAAA=$AAAA",
    "scrypt$999999999$8$1$AAAAAAAAAAA=$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
    "scrypt$1000$8$1$AAAAAAAAAAA=$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
  ];
  for (const s of bad) assert.equal(await verifyPassword("whatever123", s), false, s);
  assert.equal(await verifyPassword("x", undefined as never), false);
});
test("length policy on hash, and oversize input rejected cheaply on verify", async () => {
  await assert.rejects(() => hashPassword("short", FAST), RangeError);
  await assert.rejects(() => hashPassword("a".repeat(257), FAST), RangeError);
  const h = await hashPassword("a".repeat(256), FAST);
  assert.equal(await verifyPassword("a".repeat(100000), h), false);
});
test("rejects unsafe params on hashPassword", async () => {
  await assert.rejects(() => hashPassword("validPassword1", { N: 3, r: 8, p: 1 }), RangeError);
  await assert.rejects(() => hashPassword("validPassword1", { N: 1 << 25, r: 8, p: 1 }), RangeError);
});
test("needsRehash flags weaker-than-default hashes", async () => {
  const weak = await hashPassword("rehashMePlease1", FAST);
  assert.equal(needsRehash(weak), true);
  assert.equal(needsRehash(weak, FAST), false);
  assert.equal(needsRehash("not-a-hash"), true);
  assert.equal(DEFAULT_PARAMS.N, 16384);
});
