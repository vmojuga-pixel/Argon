export interface SubRecord {
  stripeSubscriptionId: string;
  status: string;
  plan: string;
  lastEventCreated: number;
}

export interface SubEvent {
  id: string;
  created: number;
  subscriptionId: string;
  status: string;
  plan: string;
}

export interface SubRepo {
  get(id: string): Promise<SubRecord | null>;
  put(next: SubRecord, expectedLastEventCreated: number | null): Promise<boolean>;
}

export type ApplyResult = "applied" | "stale";

export async function applySubscriptionEvent(evt: SubEvent, repo: SubRepo, maxRetries = 5): Promise<ApplyResult> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const current = await repo.get(evt.subscriptionId);
    if (current && evt.created <= current.lastEventCreated) return "stale";
    const ok = await repo.put(
      { stripeSubscriptionId: evt.subscriptionId, status: evt.status, plan: evt.plan, lastEventCreated: evt.created },
      current ? current.lastEventCreated : null,
    );
    if (ok) return "applied";
  }
  throw new Error("could not apply subscription event: too much contention");
}
