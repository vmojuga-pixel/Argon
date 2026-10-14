import { test } from "node:test";
import assert from "node:assert/strict";
import { computeEntitlement, type Subscription } from "./solution.ts";

const now = 1_700_000_000;
const DAY = 86400;
const base = (o: Partial<Subscription>): Subscription => ({ status: "active", plan: "pro", currentPeriodEnd: now + 10 * DAY, ...o });

test("no subscription -> free", () => {
  assert.deepEqual(computeEntitlement(null, now), { plan: "free", active: false, reason: "none" });
});
test("active -> paid plan", () => {
  assert.deepEqual(computeEntitlement(base({}), now), { plan: "pro", active: true, reason: "active" });
});
test("trialing until trialEnd", () => {
  assert.equal(computeEntitlement(base({ status: "trialing", trialEnd: now + DAY }), now).reason, "trial");
  assert.deepEqual(computeEntitlement(base({ status: "trialing", trialEnd: now }), now), { plan: "free", active: false, reason: "none" });
});
test("past_due grace window", () => {
  const sub = base({ status: "past_due", plan: "business", currentPeriodEnd: now - 3 * DAY });
  assert.deepEqual(computeEntitlement(sub, now), { plan: "business", active: true, reason: "grace" });
  const late = base({ status: "past_due", currentPeriodEnd: now - 7 * DAY });
  assert.equal(computeEntitlement(late, now).active, false);
});
test("canceled until period end", () => {
  const during = base({ status: "canceled", currentPeriodEnd: now + DAY });
  assert.deepEqual(computeEntitlement(during, now), { plan: "pro", active: true, reason: "canceled_until_period_end" });
  const after = base({ status: "canceled", currentPeriodEnd: now - 1 });
  assert.equal(computeEntitlement(after, now).active, false);
});
test("unpaid/incomplete/paused fail closed", () => {
  for (const status of ["unpaid", "incomplete", "incomplete_expired", "paused", "weird_new_status"]) {
    assert.deepEqual(computeEntitlement(base({ status: status as never }), now), { plan: "free", active: false, reason: "none" }, status);
  }
});
