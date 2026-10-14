export type SubStatus = "trialing" | "active" | "past_due" | "unpaid" | "canceled" | "incomplete" | "incomplete_expired" | "paused";

export interface Subscription {
  status: SubStatus;
  plan: "free" | "pro" | "business";
  currentPeriodEnd: number;
  trialEnd?: number | null;
  cancelAtPeriodEnd?: boolean;
}

export interface Entitlement {
  plan: "free" | "pro" | "business";
  active: boolean;
  reason: "active" | "trial" | "grace" | "canceled_until_period_end" | "none";
}

const GRACE_SEC = 7 * 24 * 3600;
const FREE: Entitlement = { plan: "free", active: false, reason: "none" };

export function computeEntitlement(sub: Subscription | null, nowSec: number): Entitlement {
  if (!sub) return FREE;
  const paid = sub.plan;
  switch (sub.status) {
    case "active": return { plan: paid, active: true, reason: "active" };
    case "trialing":
      if (sub.trialEnd != null && nowSec >= sub.trialEnd) return FREE;
      return { plan: paid, active: true, reason: "trial" };
    case "past_due":
      if (nowSec < sub.currentPeriodEnd + GRACE_SEC) return { plan: paid, active: true, reason: "grace" };
      return FREE;
    case "canceled":
      if (nowSec < sub.currentPeriodEnd) return { plan: paid, active: true, reason: "canceled_until_period_end" };
      return FREE;
    default: return FREE;
  }
}
