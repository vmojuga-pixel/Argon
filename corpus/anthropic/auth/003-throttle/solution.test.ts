import { test } from "node:test";
import assert from "node:assert/strict";
import { LoginThrottle } from "./solution.ts";

function setup(cfg = { maxFailures: 3, windowSec: 60, lockSec: 120 }) {
  let t = 1_000_000;
  const th = new LoginThrottle(cfg, () => t);
  return { th, advance: (sec: number) => { t += sec * 1000; } };
}

test("allowed until maxFailures reached, then locked", () => {
  const { th } = setup();
  th.recordFailure("a@x.com"); th.recordFailure("a@x.com");
  assert.equal(th.check("a@x.com").allowed, true);
  th.recordFailure("a@x.com");
  const d = th.check("a@x.com");
  assert.equal(d.allowed, false); assert.equal(d.retryAfterSec, 120);
});
test("retryAfter counts down (rounded up) and unlocks exactly at the end", () => {
  const { th, advance } = setup();
  for (let i = 0; i < 3; i++) th.recordFailure("a@x.com");
  advance(100); assert.equal(th.check("a@x.com").retryAfterSec, 20);
  advance(19.5); assert.deepEqual(th.check("a@x.com"), { allowed: false, retryAfterSec: 1 });
  advance(0.5); assert.deepEqual(th.check("a@x.com"), { allowed: true, retryAfterSec: 0 });
});
test("failures outside the window do not accumulate", () => {
  const { th, advance } = setup();
  th.recordFailure("a@x.com"); th.recordFailure("a@x.com");
  advance(61); th.recordFailure("a@x.com");
  assert.equal(th.check("a@x.com").allowed, true);
});
test("success resets the counter", () => {
  const { th } = setup();
  th.recordFailure("a@x.com"); th.recordFailure("a@x.com");
  th.recordSuccess("a@x.com");
  th.recordFailure("a@x.com"); th.recordFailure("a@x.com");
  assert.equal(th.check("a@x.com").allowed, true);
});
test("keys normalized", () => {
  const { th } = setup();
  th.recordFailure("A@X.com"); th.recordFailure("  a@x.com "); th.recordFailure("\uFF41@x.com");
  assert.equal(th.check("a@x.com").allowed, false);
});
test("different keys are independent", () => {
  const { th } = setup();
  for (let i = 0; i < 3; i++) th.recordFailure("a@x.com");
  assert.equal(th.check("b@x.com").allowed, true);
});
test("failures while locked do not extend the lock", () => {
  const { th, advance } = setup();
  for (let i = 0; i < 3; i++) th.recordFailure("a@x.com");
  advance(60);
  for (let i = 0; i < 10; i++) th.recordFailure("a@x.com");
  assert.equal(th.check("a@x.com").retryAfterSec, 60);
});
test("after unlock the full allowance is available again", () => {
  const { th, advance } = setup();
  for (let i = 0; i < 3; i++) th.recordFailure("a@x.com");
  advance(121);
  th.recordFailure("a@x.com"); th.recordFailure("a@x.com");
  assert.equal(th.check("a@x.com").allowed, true);
  th.recordFailure("a@x.com");
  assert.equal(th.check("a@x.com").allowed, false);
});
test("sweep removes stale entries but keeps locked ones", () => {
  const { th, advance } = setup();
  th.recordFailure("stale@x.com");
  for (let i = 0; i < 3; i++) th.recordFailure("locked@x.com");
  advance(70); th.sweep();
  assert.equal(th.size(), 1);
  assert.equal(th.check("locked@x.com").allowed, false);
});
test("invalid config rejected", () => {
  assert.throws(() => new LoginThrottle({ maxFailures: 0, windowSec: 60, lockSec: 60 }), RangeError);
  assert.throws(() => new LoginThrottle({ maxFailures: 3, windowSec: 0, lockSec: 60 }), RangeError);
});
