import { test } from "node:test";
import assert from "node:assert/strict";
import { priceTiered, buildInvoice, type Tier } from "./solution.ts";

const tiers: Tier[] = [
  { upTo: 1000, unitPriceCents: 10 },
  { upTo: 10000, unitPriceCents: 5 },
  { upTo: null, unitPriceCents: 2 },
];

test("zero units -> no lines", () => {
  assert.deepEqual(priceTiered(0, tiers), []);
  assert.equal(buildInvoice(0, tiers, 600).totalCents, 0);
});
test("within first tier", () => {
  assert.deepEqual(priceTiered(250, tiers), [{ description: "Tier 1", quantity: 250, amountCents: 2500 }]);
});
test("exact boundary doesn't open next tier", () => {
  const lines = priceTiered(1000, tiers);
  assert.equal(lines.length, 1);
  assert.equal(lines[0].amountCents, 10000);
});
test("graduated across all tiers", () => {
  const inv = buildInvoice(12000, tiers, 0);
  assert.equal(inv.subtotalCents, 59000);
  assert.equal(inv.lines.length, 3);
});
test("flat fee once per used tier", () => {
  const t: Tier[] = [
    { upTo: 100, unitPriceCents: 0, flatFeeCents: 4900 },
    { upTo: null, unitPriceCents: 3, flatFeeCents: 0 },
  ];
  assert.equal(buildInvoice(50, t, 0).subtotalCents, 4900);
  assert.equal(buildInvoice(150, t, 0).subtotalCents, 4900 + 150);
});
test("tax integer math half-up", () => {
  assert.equal(buildInvoice(250, tiers, 600).taxCents, 150);
  assert.equal(buildInvoice(1, tiers, 500).taxCents, 1);
  assert.equal(buildInvoice(1, tiers, 490).taxCents, 0);
});
test("all amounts integers", () => {
  const inv = buildInvoice(7777, tiers, 825);
  for (const v of [inv.subtotalCents, inv.taxCents, inv.totalCents, ...inv.lines.map(l => l.amountCents)]) {
    assert.ok(Number.isInteger(v));
  }
  assert.equal(inv.totalCents, inv.subtotalCents + inv.taxCents);
});
test("rejects invalid input", () => {
  assert.throws(() => priceTiered(-1, tiers), RangeError);
  assert.throws(() => priceTiered(1.5, tiers), RangeError);
  assert.throws(() => priceTiered(10, []), /tiers required/);
  assert.throws(() => priceTiered(5000, [{ upTo: 1000, unitPriceCents: 1 }]), /cover/);
  assert.throws(() => priceTiered(10, [{ upTo: null, unitPriceCents: 1 }, { upTo: null, unitPriceCents: 2 }]), /last tier/);
  assert.throws(() => priceTiered(10, [{ upTo: 100, unitPriceCents: 1 }, { upTo: 50, unitPriceCents: 1 }, { upTo: null, unitPriceCents: 1 }]), /increasing/);
});
