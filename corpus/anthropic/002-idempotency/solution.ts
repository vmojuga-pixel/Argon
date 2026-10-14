export interface StripeEvent {
  id: string;
  type: string;
  created: number;
  data: { object: Record<string, unknown> };
}

export interface EventStore {
  claim(eventId: string): Promise<boolean>;
  release(eventId: string): Promise<void>;
}

export type Handlers = Record<string, (event: StripeEvent) => Promise<void>>;
export type Result = "processed" | "duplicate" | "ignored";

export async function processWebhookEvent(
  event: StripeEvent,
  store: EventStore,
  handlers: Handlers,
): Promise<Result> {
  const handler = handlers[event.type];
  if (!handler) return "ignored";

  const claimed = await store.claim(event.id);
  if (!claimed) return "duplicate";

  try {
    await handler(event);
    return "processed";
  } catch (err) {
    await store.release(event.id);
    throw err;
  }
}
