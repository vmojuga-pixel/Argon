import { test } from "node:test";
import assert from "node:assert/strict";
import { processWebhookEvent, type EventStore, type StripeEvent } from "./solution.ts";

function memStore(): EventStore & { seen: Set<string> } {
  const seen = new Set<string>();
  return {
    seen,
    async claim(id) { await Promise.resolve(); if (seen.has(id)) return false; seen.add(id); return true; },
    async release(id) { seen.delete(id); },
  };
}
const ev = (id: string, type = "invoice.paid"): StripeEvent => ({ id, type, created: 1, data: { object: {} } });

test("processes once, duplicate returns 'duplicate'", async () => {
  const store = memStore();
  let calls = 0;
  const handlers = { "invoice.paid": async () => { calls++; } };
  assert.equal(await processWebhookEvent(ev("e1"), store, handlers), "processed");
  assert.equal(await processWebhookEvent(ev("e1"), store, handlers), "duplicate");
  assert.equal(calls, 1);
});
test("concurrent deliveries run handler once", async () => {
  const store = memStore();
  let calls = 0;
  const handlers = { "invoice.paid": async () => { await new Promise(r => setTimeout(r, 5)); calls++; } };
  const results = await Promise.all(Array.from({ length: 10 }, () => processWebhookEvent(ev("e2"), store, handlers)));
  assert.equal(calls, 1);
  assert.equal(results.filter(r => r === "processed").length, 1);
  assert.equal(results.filter(r => r === "duplicate").length, 9);
});
test("unknown event type ignored, not claimed", async () => {
  const store = memStore();
  assert.equal(await processWebhookEvent(ev("e3", "foo.bar"), store, {}), "ignored");
  assert.equal(store.seen.size, 0);
});
test("handler failure releases claim", async () => {
  const store = memStore();
  let fail = true, calls = 0;
  const handlers = { "invoice.paid": async () => { calls++; if (fail) throw new Error("db down"); } };
  await assert.rejects(() => processWebhookEvent(ev("e4"), store, handlers), /db down/);
  assert.equal(store.seen.has("e4"), false);
  fail = false;
  assert.equal(await processWebhookEvent(ev("e4"), store, handlers), "processed");
  assert.equal(calls, 2);
});
