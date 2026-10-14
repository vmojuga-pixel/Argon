import { createTenant } from './tenant.js';

const CORS = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };

export async function handleSignup(request, env) {
  let body;
  try { body = await request.json(); } catch { return Response.json({ error: 'invalid json' }, { status: 400, headers: CORS }); }

  const email = (body.email || '').trim().toLowerCase();
  const company = (body.company || '').trim();
  const plan = (body.plan || 'free').trim();

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return Response.json({ error: 'invalid email' }, { status: 400, headers: CORS });
  }
  if (!['free', 'starter', 'pro'].includes(plan)) {
    return Response.json({ error: 'invalid plan' }, { status: 400, headers: CORS });
  }

  const existing = await env.DB.prepare('SELECT id FROM tenants WHERE email = ?').bind(email).first();
  if (existing) return Response.json({ error: 'email already registered' }, { status: 409, headers: CORS });

  const result = await createTenant(env, { email, company, plan });

  return Response.json({
    ok: true,
    tenant_id: result.tenant_id,
    api_key: result.api_key,
    api_key_prefix: result.api_key_prefix,
    plan: result.plan,
    message: 'SAVE YOUR API KEY. It will not be shown again.',
    docs: 'https://argon.vmojuga.workers.dev/docs',
    next: plan === 'free'
      ? 'Upgrade to Starter ($29/mo) for agent + swarm access.'
      : 'Configure billing via /billing/portal'
  }, { status: 201, headers: CORS });
}

export async function handleMe(request, env, auth) {
  const tenant = await env.DB.prepare(
    'SELECT id, email, company, plan, status, created_at FROM tenants WHERE id = ?'
  ).bind(auth.tenantId).first();

  const period = new Date().toISOString().slice(0, 7);
  const usage = await env.DB.prepare(
    'SELECT chat_count, agent_count, swarm_count, tokens_used, cost_usd FROM usage_counters WHERE tenant_id = ? AND period = ?'
  ).bind(auth.tenantId, period).first() || { chat_count: 0, agent_count: 0, swarm_count: 0, tokens_used: 0, cost_usd: 0 };

  const plan = await env.DB.prepare('SELECT * FROM plans WHERE id = ?').bind(tenant.plan).first();

  return Response.json({
    tenant,
    plan,
    usage_current_period: { period, ...usage },
    quota: {
      chat: plan.monthly_chat_quota === -1 ? 'unlimited' : plan.monthly_chat_quota,
      agent: plan.monthly_agent_quota === -1 ? 'unlimited' : plan.monthly_agent_quota,
      swarm: plan.monthly_swarm_quota === -1 ? 'unlimited' : plan.monthly_swarm_quota
    }
  }, { headers: CORS });
}

export async function handleRotateKey(request, env, auth) {
  const { generateTenantKey } = await import('./tenant.js');
  const k = await generateTenantKey(auth.tenantId, 'rotated', auth.scopes.join(','));
  const id = `k_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;
  await env.DB.prepare(
    'INSERT INTO tenant_api_keys (id, tenant_id, key_hash, key_prefix, label, scopes) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(id, auth.tenantId, k.hash, k.prefix, k.label, k.scopes).run();
  return Response.json({ ok: true, api_key: k.raw, prefix: k.prefix, warning: 'Old keys remain valid until revoked.' });
}

export async function handleRevokeKey(request, env, auth) {
  let body = {};
  try { body = await request.json(); } catch {}
  const prefix = (body.prefix || '').trim();
  if (!prefix) return Response.json({ error: 'prefix required' }, { status: 400 });
  const r = await env.DB.prepare(
    'UPDATE tenant_api_keys SET revoked = 1 WHERE tenant_id = ? AND key_prefix = ?'
  ).bind(auth.tenantId, prefix).run();
  return Response.json({ ok: true, revoked: r.meta.changes });
}
