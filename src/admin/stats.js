export async function handleAdminStats(env) {
  const [tenants, plans, usageToday, webhookCount, sessionsTotal, keysActive] = await Promise.all([
    env.DB.prepare('SELECT COUNT(*) as c FROM tenants').first(),
    env.DB.prepare("SELECT plan, COUNT(*) as c FROM tenants GROUP BY plan").all(),
    env.DB.prepare("SELECT SUM(chat_count) as chat, SUM(agent_count) as agent, SUM(swarm_count) as swarm FROM usage_counters WHERE period = ?").bind(new Date().toISOString().slice(0,7)).first(),
    env.DB.prepare('SELECT COUNT(*) as c FROM webhooks WHERE active = 1').first(),
    env.DB.prepare('SELECT COUNT(*) as c FROM sessions').first(),
    env.DB.prepare('SELECT COUNT(*) as c FROM tenant_api_keys WHERE revoked = 0').first()
  ]);

  const recentTenants = await env.DB.prepare(
    'SELECT id, email, plan, status, created_at FROM tenants ORDER BY created_at DESC LIMIT 10'
  ).all();

  return {
    summary: {
      tenants_total: tenants?.c || 0,
      tenants_by_plan: Object.fromEntries((plans.results || []).map(r => [r.plan, r.c])),
      active_api_keys: keysActive?.c || 0,
      webhooks_active: webhookCount?.c || 0,
      sessions_total: sessionsTotal?.c || 0,
      usage_this_month: {
        chat: usageToday?.chat || 0,
        agent: usageToday?.agent || 0,
        swarm: usageToday?.swarm || 0
      }
    },
    recent_signups: recentTenants.results || [],
    ts: Date.now()
  };
}

export async function handleAdminTenants(env) {
  const rows = await env.DB.prepare(
    `SELECT t.id, t.email, t.company, t.plan, t.status, t.created_at,
       (SELECT COUNT(*) FROM tenant_api_keys WHERE tenant_id = t.id AND revoked = 0) as keys_count,
       (SELECT COUNT(*) FROM webhooks WHERE tenant_id = t.id AND active = 1) as webhooks_count
     FROM tenants t ORDER BY t.created_at DESC LIMIT 100`
  ).all();
  return { tenants: rows.results || [] };
}

export async function handleAdminUsage(env, period = null) {
  const p = period || new Date().toISOString().slice(0, 7);
  const rows = await env.DB.prepare(
    `SELECT u.tenant_id, t.email, t.plan, u.chat_count, u.agent_count, u.swarm_count, u.tokens_used, u.cost_usd
     FROM usage_counters u
     JOIN tenants t ON t.id = u.tenant_id
     WHERE u.period = ?
     ORDER BY (u.chat_count + u.agent_count + u.swarm_count) DESC
     LIMIT 100`
  ).bind(p).all();
  return { period: p, rows: rows.results || [] };
}
