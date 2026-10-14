import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { verifyStripeSignature, SignatureError } from "./solution.ts";

const secret = "whsec_test_123";
const body = '{"id":"evt_1","type":"invoice.paid"}';
const now = 1_700_000_000;
const sign = (t: number, b = body, s = secret) =>
  createHmac("sha256", s).update(`${t}.${b}`).digest("hex");

test("valid signature passes", () => {
  verifyStripeSignature(body, `t=${now},v1=${sign(now)}`, secret, 300, now);
});
test("rotation: passes if any v1 matches", () => {
  const h = `t=${now},v1=${"0".repeat(64)},v1=${sign(now)}`;
  verifyStripeSignature(body, h, secret, 300, now);
});
test("rejects missing header", () => {
  assert.throws(() => verifyStripeSignature(body, undefined, secret, 300, now), SignatureError);
  assert.throws(() => verifyStripeSignature(body, "", secret, 300, now), SignatureError);
});
test("rejects tampered body", () => {
  assert.throws(() => verifyStripeSignature(body + " ", `t=${now},v1=${sign(now)}`, secret, 300, now), SignatureError);
});
test("rejects wrong secret", () => {
  assert.throws(() => verifyStripeSignature(body, `t=${now},v1=${sign(now, body, "other")}`, secret, 300, now), SignatureError);
});
test("rejects old and future timestamps", () => {
  const old = now - 301;
  assert.throws(() => verifyStripeSignature(body, `t=${old},v1=${sign(old)}`, secret, 300, now), SignatureError);
  const future = now + 301;
  assert.throws(() => verifyStripeSignature(body, `t=${future},v1=${sign(future)}`, secret, 300, now), SignatureError);
});
test("boundary: exactly at tolerance passes", () => {
  const t = now - 300;
  verifyStripeSignature(body, `t=${t},v1=${sign(t)}`, secret, 300, now);
});
test("malformed signature never throws non-SignatureError", () => {
  for (const sig of ["zz", "abc", "", "0".repeat(63), "0".repeat(65)]) {
    assert.throws(() => verifyStripeSignature(body, `t=${now},v1=${sig}`, secret, 300, now), SignatureError);
  }
  assert.throws(() => verifyStripeSignature(body, "garbage", secret, 300, now), SignatureError);
  assert.throws(() => verifyStripeSignature(body, `t=abc,v1=${sign(now)}`, secret, 300, now), SignatureError);
});
