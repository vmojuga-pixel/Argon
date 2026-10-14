// Tenant + API key management for SaaS

async function hashKey(key) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(key));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function generateTenantKey(tenantId, label = 'default', scopes = 'chat') {
  const raw = `arg_${tenantId.slice(0, 8)}_${crypto.randomUUID().replace(/-/g, '')}`;
  const hash = await hashKey(raw);
  const prefix = raw.slice(0, 12);
  return { raw, hash, prefix, label, scopes };
}

export async function createTenant(env, { email, company, plan = 'free' }) {
  const id = `tn_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;
  await env.DB.prepare(
    'INSERT INTO tenants (id, email, company, plan) VALUES (?, ?, ?, ?)'
  ).bind(id, email, company || null, plan).run();

  const k = await generateTenantKey(id, 'primary', plan === 'free' ? 'chat' : 'chat,agent,swarm');
  await env.DB.prepare(
    'INSERT INTO tenant_api_keys (id, tenant_id, key_hash, key_prefix, label, scopes) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(`k_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`, id, k.hash, k.prefix, k.label, k.scopes).run();

  return { tenant_id: id, api_key: k.raw, api_key_prefix: k.prefix, plan };
}

export async function validateTenantKey(env, rawKey) {
  if (!rawKey) return { ok: false, error: 'missing key' };
  const hash = await hashKey(rawKey);

  const row = await env.DB.prepare(`
    SELECT k.id as key_id, k.tenant_id, k.scopes, t.plan, t.status
    FROM tenant_api_keys k
    JOIN tenants t ON t.id = k.tenant_id
    WHERE k.key_hash = ? AND k.revoked = 0 AND t.status = 'active'
    LIMIT 1
  `).bind(hash).first();

  if (!row) {
    // DEBUG: fallback plaintext check
    const raw = await env.DB.prepare("SELECT k.id as key_id, k.tenant_id, k.scopes, t.plan FROM tenant_api_keys k JOIN tenants t ON t.id = k.tenant_id WHERE k.revoked = 0 AND t.status = 'active' LIMIT 1").first();
    if (raw) return { ok: false, error: 'hash mismatch - db has rows but no match' };
    return { ok: false, error: 'no valid tenant key in DB' };
  }
  await env.DB.prepare('UPDATE tenant_api_keys SET last_used = unixepoch() WHERE id = ?').bind(row.key_id).run();
  return { ok: true, tenantId: row.tenant_id, plan: row.plan, scopes: row.scopes.split(','), keyId: row.key_id };
}

export async function checkQuota(env, tenantId, resource, amount = 1) {
  const period = new Date().toISOString().slice(0, 7); // YYYY-MM
  const plan = await env.DB.prepare(`
    SELECT p.* FROM plans p
    JOIN tenants t ON t.plan = p.id
    WHERE t.id = ?
  `).bind(tenantId).first();
  if (!plan) return { ok: false, error: 'plan not found' };

  const counter = await env.DB.prepare(
    'SELECT * FROM usage_counters WHERE tenant_id = ? AND period = ?'
  ).bind(tenantId, period).first() || { chat_count: 0, agent_count: 0, swarm_count: 0 };

  const quotaField = { chat: 'monthly_chat_quota', agent: 'monthly_agent_quota', swarm: 'monthly_swarm_quota' }[resource];
  const counterField = { chat: 'chat_count', agent: 'agent_count', swarm: 'swarm_count' }[resource];
  const limit = plan[quotaField];
  const used = counter[counterField] || 0;

  if (limit === -1) return { ok: true, used, limit: 'unlimited', plan: plan.id };
  if (used + amount > limit) return { ok: false, error: 'quota exceeded', used, limit, plan: plan.id };
  return { ok: true, used, limit, plan: plan.id };
}

export async function incrementUsage(env, tenantId, resource, tokens = 0, cost = 0) {
  const period = new Date().toISOString().slice(0, 7);
  const field = { chat: 'chat_count', agent: 'agent_count', swarm: 'swarm_count' }[resource];
  await env.DB.prepare(`
    INSERT INTO usage_counters (tenant_id, period, ${field}, tokens_used, cost_usd)
    VALUES (?, ?, 1, ?, ?)
    ON CONFLICT(tenant_id, period) DO UPDATE SET
      ${field} = ${field} + 1,
      tokens_used = tokens_used + ?,
      cost_usd = cost_usd + ?
  `).bind(tenantId, period, tokens, cost, tokens, cost).run();
}

export async function listUsage(env, tenantId, period = null) {
  const p = period || new Date().toISOString().slice(0, 7);
  return await env.DB.prepare(
    'SELECT * FROM usage_counters WHERE tenant_id = ? AND period = ?'
  ).bind(tenantId, p).first();
}
