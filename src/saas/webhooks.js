// Webhook system with HMAC-SHA256 signing + retry

const VALID_EVENTS = ['chat.completed', 'agent.completed', 'swarm.cycle', 'quota.warning', 'quota.exceeded', 'key.created', 'key.revoked'];

async function hmacSign(secret, payload) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function genSecret() {
  return 'whsec_' + Array.from(crypto.getRandomValues(new Uint8Array(24))).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function registerWebhook(env, tenantId, { url, events }) {
  if (!url || !/^https:\/\//.test(url)) return { ok: false, error: 'url must be https' };
  const evtList = (events || ['chat.completed']).filter(e => VALID_EVENTS.includes(e));
  if (!evtList.length) return { ok: false, error: 'no valid events', valid: VALID_EVENTS };

  const id = `wh_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;
  const secret = genSecret();

  await env.DB.prepare(
    'INSERT INTO webhooks (id, tenant_id, url, secret, events) VALUES (?, ?, ?, ?, ?)'
  ).bind(id, tenantId, url, secret, evtList.join(',')).run();

  return { ok: true, webhook_id: id, url, events: evtList, secret, note: 'Save the secret. Used to verify HMAC signatures.' };
}

export async function listWebhooks(env, tenantId) {
  const rows = await env.DB.prepare(
    'SELECT id, url, events, active, created_at, last_fired_at, failure_count FROM webhooks WHERE tenant_id = ? ORDER BY created_at DESC'
  ).bind(tenantId).all();
  return rows.results || [];
}

export async function deleteWebhook(env, tenantId, webhookId) {
  const r = await env.DB.prepare('DELETE FROM webhooks WHERE id = ? AND tenant_id = ?').bind(webhookId, tenantId).run();
  return { ok: true, deleted: r.meta.changes };
}

export async function dispatchEvent(env, tenantId, eventType, payload) {
  const rows = await env.DB.prepare(
    "SELECT id, url, secret FROM webhooks WHERE tenant_id = ? AND active = 1 AND (events LIKE ? OR events LIKE ?)"
  ).bind(tenantId, `%${eventType}%`, '%*%').all();

  const hooks = rows.results || [];
  if (!hooks.length) return { dispatched: 0 };

  const body = JSON.stringify({
    event: eventType,
    tenant_id: tenantId,
    ts: Date.now(),
    data: payload
  });

  const results = await Promise.allSettled(hooks.map(async (h) => {
    const sig = await hmacSign(h.secret, body);
    const deliveryId = crypto.randomUUID();
    let status = 0, err = null;
    try {
      const res = await fetch(h.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Argon-Signature': `sha256=${sig}`,
          'X-Argon-Event': eventType,
          'X-Argon-Delivery': deliveryId
        },
        body
      });
      status = res.status;
      if (!res.ok) err = `HTTP ${res.status}`;
    } catch (e) { err = e.message; }

    await env.DB.prepare(
      'INSERT INTO webhook_deliveries (webhook_id, event_type, status_code, last_error) VALUES (?, ?, ?, ?)'
    ).bind(h.id, eventType, status, err).run();

    if (err) {
      await env.DB.prepare('UPDATE webhooks SET failure_count = failure_count + 1 WHERE id = ?').bind(h.id).run();
      if (parseInt(await env.KV.get(`wh_fail:${h.id}`) || '0', 10) >= 10) {
        await env.DB.prepare('UPDATE webhooks SET active = 0 WHERE id = ?').bind(h.id).run();
      }
    } else {
      await env.DB.prepare('UPDATE webhooks SET last_fired_at = unixepoch(), failure_count = 0 WHERE id = ?').bind(h.id).run();
    }
    return { webhook_id: h.id, status, err };
  }));

  return { dispatched: hooks.length, results: results.map(r => r.value || { error: r.reason }) };
}
