export interface Tier {
  upTo: number | null;
  unitPriceCents: number;
  flatFeeCents?: number;
}

export interface InvoiceLine {
  description: string;
  quantity: number;
  amountCents: number;
}

export interface Invoice {
  lines: InvoiceLine[];
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
}

function assertInt(n: number, name: string): void {
  if (!Number.isInteger(n) || n < 0) throw new RangeError(`${name} must be a non-negative integer`);
}

export function priceTiered(units: number, tiers: Tier[]): InvoiceLine[] {
  assertInt(units, "units");
  if (tiers.length === 0) throw new Error("tiers required");
  let last = 0;
  tiers.forEach((t, i) => {
    assertInt(t.unitPriceCents, "unitPriceCents");
    if (t.flatFeeCents !== undefined) assertInt(t.flatFeeCents, "flatFeeCents");
    if (t.upTo === null) {
      if (i !== tiers.length - 1) throw new Error("only last tier can be unbounded");
    } else {
      if (t.upTo <= last) throw new Error("tiers must be strictly increasing");
      last = t.upTo;
    }
  });
  const lines: InvoiceLine[] = [];
  let prevCap = 0;
  let remaining = units;
  for (let i = 0; i < tiers.length && remaining > 0; i++) {
    const t = tiers[i];
    const cap = t.upTo;
    const span = cap === null ? remaining : Math.min(remaining, cap - prevCap);
    lines.push({ description: `Tier ${i + 1}`, quantity: span, amountCents: span * t.unitPriceCents + (t.flatFeeCents ?? 0) });
    remaining -= span;
    if (cap !== null) prevCap = cap;
  }
  if (remaining > 0) throw new Error("tiers do not cover all units");
  return lines;
}

export function buildInvoice(units: number, tiers: Tier[], taxBps: number): Invoice {
  assertInt(taxBps, "taxBps");
  const lines = priceTiered(units, tiers);
  const subtotalCents = lines.reduce((s, l) => s + l.amountCents, 0);
  const taxCents = Math.floor((subtotalCents * taxBps + 5000) / 10000);
  return { lines, subtotalCents, taxCents, totalCents: subtotalCents + taxCents };
}
