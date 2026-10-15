// Daily AI usage guard — stop calling AI if approaching free tier limit
const DAILY_NEURON_LIMIT = 9000; // safe margin below 10k

export async function checkAIQuota(env) {
  const today = new Date().toISOString().slice(0, 10);
  const key = `ai_usage:${today}`;
  const raw = await env.KV.get(key);
  const usage = raw ? parseInt(raw, 10) : 0;

  if (usage >= DAILY_NEURON_LIMIT) {
    return { allowed: false, used: usage, limit: DAILY_NEURON_LIMIT };
  }
  return { allowed: true, used: usage, limit: DAILY_NEURON_LIMIT, remaining: DAILY_NEURON_LIMIT - usage };
}

export async function recordAIUsage(env, neurons = 30) {
  const today = new Date().toISOString().slice(0, 10);
  const key = `ai_usage:${today}`;
  const raw = await env.KV.get(key);
  const usage = (raw ? parseInt(raw, 10) : 0) + neurons;
  await env.KV.put(key, String(usage), { expirationTtl: 86400 * 2 });
  return usage;
}
