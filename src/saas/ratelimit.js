const TIER_LIMITS = {
  free:       { rpm: 10,   burst: 20 },
  starter:    { rpm: 60,   burst: 120 },
  pro:        { rpm: 300,  burst: 600 },
  enterprise: { rpm: 1000, burst: 2000 }
};

export async function checkRateLimit(env, tenantId, plan = 'free') {
  const limits = TIER_LIMITS[plan] || TIER_LIMITS.free;
  const now = Math.floor(Date.now() / 1000);
  const minute = Math.floor(now / 60);
  const key = `rl:${tenantId}:${minute}`;

  const current = parseInt(await env.KV.get(key) || '0', 10);
  const resetIn = 60 - (now % 60);

  if (current >= limits.rpm) {
    return { ok: false, limit: limits.rpm, used: current, remaining: 0, reset_in: resetIn };
  }

  await env.KV.put(key, String(current + 1), { expirationTtl: 120 });
  return { ok: true, limit: limits.rpm, used: current + 1, remaining: limits.rpm - current - 1, reset_in: resetIn };
}

export function rateHeaders(rl) {
  return {
    'X-RateLimit-Limit': String(rl.limit),
    'X-RateLimit-Remaining': String(rl.remaining ?? 0),
    'X-RateLimit-Reset': String(rl.reset_in ?? 60)
  };
}
