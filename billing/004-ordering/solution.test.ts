import { test } from "node:test";
import assert from "node:assert/strict";
import { applySubscriptionEvent, type SubRepo, type SubRecord, type SubEvent } from "./solution.ts";

function memRepo(onBeforePut?: () => void): SubRepo & { rows: Map<string, SubRecord> } {
  const rows = new Map<string, SubRecord>();
  return {
    rows,
    async get(id) { await Promise.resolve(); const r = rows.get(id); return r ? { ...r } : null; },
    async put(next, expected) {
      onBeforePut?.();
      await Promise.resolve();
      const cur = rows.get(next.stripeSubscriptionId);
      const curVal = cur ? cur.lastEventCreated : null;
      if (curVal !== expected) return false;
      rows.set(next.stripeSubscriptionId, { ...next });
      return true;
    },
  };
}
const evt = (created: number, status: string, plan = "pro"): SubEvent => ({ id: `e${created}`, created, subscriptionId: "sub_1", status, plan });

test("first event creates row", async () => {
  const repo = memRepo();
  assert.equal(await applySubscriptionEvent(evt(100, "active"), repo), "applied");
  assert.equal(repo.rows.get("sub_1")?.status, "active");
});
test("older event is stale", async () => {
  const repo = memRepo();
  await applySubscriptionEvent(evt(200, "canceled"), repo);
  assert.equal(await applySubscriptionEvent(evt(100, "active"), repo), "stale");
});
test("same-timestamp replay stale", async () => {
  const repo = memRepo();
  await applySubscriptionEvent(evt(100, "active"), repo);
  assert.equal(await applySubscriptionEvent(evt(100, "past_due"), repo), "stale");
});
test("out-of-order burst converges", async () => {
  const repo = memRepo();
  const order = [300, 100, 500, 200, 400];
  const st: Record<number, string> = { 100: "trialing", 200: "active", 300: "past_due", 400: "active", 500: "canceled" };
  await Promise.all(order.map(t => applySubscriptionEvent(evt(t, st[t]), repo)));
  assert.equal(repo.rows.get("sub_1")?.status, "canceled");
  assert.equal(repo.rows.get("sub_1")?.lastEventCreated, 500);
});
test("lost CAS race retried", async () => {
  let injected = false;
  const repo = memRepo(() => { if (!injected) { injected = true; repo.rows.set("sub_1", { stripeSubscriptionId: "sub_1", status: "past_due", plan: "pro", lastEventCreated: 150 }); } });
  assert.equal(await applySubscriptionEvent(evt(200, "active"), repo), "applied");
});
test("lost race vs newer writer = stale", async () => {
  let injected = false;
  const repo = memRepo(() => { if (!injected) { injected = true; repo.rows.set("sub_1", { stripeSubscriptionId: "sub_1", status: "canceled", plan: "pro", lastEventCreated: 999 }); } });
  assert.equal(await applySubscriptionEvent(evt(200, "active"), repo), "stale");
});
test("permanent contention throws", async () => {
  const repo: SubRepo = { get: async () => null, put: async () => false };
  await assert.rejects(() => applySubscriptionEvent(evt(1, "active"), repo, 3), /contention/);
});
