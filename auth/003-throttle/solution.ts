export interface ThrottleConfig { maxFailures: number; windowSec: number; lockSec: number; }
export interface Decision { allowed: boolean; retryAfterSec: number; }
interface Entry { failures: number[]; lockedUntil: number; }

export class LoginThrottle {
  private entries = new Map<string, Entry>();
  private ops = 0;
  private cfg: ThrottleConfig;
  private now: () => number;

  constructor(cfg: ThrottleConfig, now: () => number = Date.now) {
    if (cfg.maxFailures < 1 || cfg.windowSec <= 0 || cfg.lockSec <= 0) throw new RangeError("invalid throttle config");
    this.cfg = cfg; this.now = now;
  }
  private norm(key: string): string { return key.normalize("NFKC").trim().toLowerCase(); }

  check(key: string): Decision {
    const e = this.entries.get(this.norm(key));
    const t = this.now();
    if (e && e.lockedUntil > t) return { allowed: false, retryAfterSec: Math.ceil((e.lockedUntil - t) / 1000) };
    return { allowed: true, retryAfterSec: 0 };
  }
  recordFailure(key: string): void {
    const k = this.norm(key);
    const t = this.now();
    let e = this.entries.get(k);
    if (!e) { e = { failures: [], lockedUntil: 0 }; this.entries.set(k, e); }
    if (e.lockedUntil > t) return;
    const cutoff = t - this.cfg.windowSec * 1000;
    e.failures = e.failures.filter((f) => f > cutoff);
    e.failures.push(t);
    if (e.failures.length >= this.cfg.maxFailures) {
      e.lockedUntil = t + this.cfg.lockSec * 1000;
      e.failures = [];
    }
    if (++this.ops % 1000 === 0) this.sweep();
  }
  recordSuccess(key: string): void { this.entries.delete(this.norm(key)); }
  sweep(): void {
    const t = this.now();
    const cutoff = t - this.cfg.windowSec * 1000;
    for (const [k, e] of this.entries) {
      const hasRecent = e.failures.some((f) => f > cutoff);
      if (e.lockedUntil <= t && !hasRecent) this.entries.delete(k);
    }
  }
  size(): number { return this.entries.size; }
}
