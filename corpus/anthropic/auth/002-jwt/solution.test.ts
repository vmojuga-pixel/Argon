import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { signJwt, verifyJwt, JwtError } from "./solution.ts";

const secret = "a-very-long-secret-key-at-least-32-bytes!!";
const now = 1_700_000_000;
const b64 = (o: unknown) => Buffer.from(JSON.stringify(o)).toString("base64url");
function manual(header: object, claims: object, key = secret) {
  const data = `${b64(header)}.${b64(claims)}`;
  return `${data}.${createHmac("sha256", key).update(data).digest("base64url")}`;
}

test("round trip returns claims", () => {
  const t = signJwt({ sub: "u1", role: "admin" }, secret, { expiresInSec: 60, nowSec: now });
  const c = verifyJwt(t, secret, { nowSec: now + 10 });
  assert.equal(c.sub, "u1"); assert.equal(c.role, "admin"); assert.equal(c.exp, now + 60);
});
test("rejects expired, including exactly at exp", () => {
  const t = signJwt({ sub: "u1" }, secret, { expiresInSec: 60, nowSec: now });
  assert.throws(() => verifyJwt(t, secret, { nowSec: now + 60 }), /expired/);
  assert.throws(() => verifyJwt(t, secret, { nowSec: now + 999 }), JwtError);
});
test("clock skew tolerance extends expiry slightly", () => {
  const t = signJwt({ sub: "u1" }, secret, { expiresInSec: 60, nowSec: now });
  verifyJwt(t, secret, { nowSec: now + 65, clockSkewSec: 10 });
  assert.throws(() => verifyJwt(t, secret, { nowSec: now + 70, clockSkewSec: 10 }), /expired/);
});
test("rejects alg=none (unsigned) token", () => {
  const unsigned = `${b64({ alg: "none", typ: "JWT" })}.${b64({ sub: "u1", exp: now + 100 })}.`;
  assert.throws(() => verifyJwt(unsigned, secret, { nowSec: now }), JwtError);
});
test("rejects other algorithms even if signature is valid", () => {
  const t = manual({ alg: "HS512", typ: "JWT" }, { sub: "u1", exp: now + 100 });
  assert.throws(() => verifyJwt(t, secret, { nowSec: now }), /algorithm/);
});
test("rejects tampered payload and wrong secret", () => {
  const t = signJwt({ sub: "u1", role: "member" }, secret, { expiresInSec: 60, nowSec: now });
  const [h, , s] = t.split(".");
  const forged = `${h}.${b64({ sub: "u1", role: "owner", exp: now + 60 })}.${s}`;
  assert.throws(() => verifyJwt(forged, secret, { nowSec: now }), /signature/);
  assert.throws(() => verifyJwt(t, "another-secret-key-also-32-bytes-long!!", { nowSec: now }), /signature/);
});
test("exp is mandatory", () => {
  const t = manual({ alg: "HS256", typ: "JWT" }, { sub: "u1" });
  assert.throws(() => verifyJwt(t, secret, { nowSec: now }), /missing exp/);
});
test("nbf enforced", () => {
  const t = manual({ alg: "HS256", typ: "JWT" }, { sub: "u1", exp: now + 100, nbf: now + 30 });
  assert.throws(() => verifyJwt(t, secret, { nowSec: now }), /not yet valid/);
  verifyJwt(t, secret, { nowSec: now + 30 });
});
test("issuer and audience checks", () => {
  const t = signJwt({ iss: "myapp", aud: ["web", "api"] }, secret, { expiresInSec: 60, nowSec: now });
  verifyJwt(t, secret, { nowSec: now, issuer: "myapp", audience: "api" });
  assert.throws(() => verifyJwt(t, secret, { nowSec: now, issuer: "evil" }), /issuer/);
  assert.throws(() => verifyJwt(t, secret, { nowSec: now, audience: "admin" }), /audience/);
});
test("malformed tokens only throw JwtError", () => {
  for (const t of ["", "a.b", "a.b.c.d", "a.b.c", "!!.@@.##", "e30.e30.", `${b64("x")}.${b64({})}.abc`]) {
    assert.throws(() => verifyJwt(t, secret, { nowSec: now }), JwtError, t);
  }
  assert.throws(() => verifyJwt(undefined as never, secret), JwtError);
});
test("weak secret and invalid lifetime rejected", () => {
  assert.throws(() => signJwt({}, "short", { expiresInSec: 60 }), /at least 32/);
  assert.throws(() => verifyJwt("a.b.c", "short"), /at least 32/);
  assert.throws(() => signJwt({}, secret, { expiresInSec: 0 }), RangeError);
  assert.throws(() => signJwt({}, secret, { expiresInSec: 1.5 }), RangeError);
});
