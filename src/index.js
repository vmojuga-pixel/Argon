import { renderLanding } from './web/landing.js';
import { renderSwarmUI } from './web/swarm-ui.js';
import { renderDashboard } from './web/dashboard.js';
import { renderDocs } from './web/docs.js';
import { handleChat } from './api/chat.js';
import { handleAgent } from './api/agent.js';
import { validateApiKey, validateBasicAuth } from './auth/apikey.js';
import { SwarmBrain } from './swarm.js';
import { validateTenantKey, checkQuota, incrementUsage } from './saas/tenant.js';
import { checkRateLimit, rateHeaders } from './saas/ratelimit.js';
import { registerWebhook, listWebhooks, deleteWebhook, dispatchEvent } from './saas/webhooks.js';
import { handleSignup, handleMe, handleRotateKey, handleRevokeKey } from './saas/signup.js';
import { handleAdminStats, handleAdminTenants, handleAdminUsage } from './admin/stats.js';
import { handleAdminRotateKey } from './admin/recover.js';

export { SwarmBrain };

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key, X-Swarm-ID, Idempotency-Key',
};

function resolveSwarmId(request, url) {
  return url.searchParams.get('swarm') || request.headers.get('X-Swarm-ID') || 'GLOBAL_CORP_SWARM';
}

async function authenticate(request, env) {
  const raw = (request.headers.get('x-api-key') || '').trim();
  if (!raw) return { ok: false, error: 'missing api key' };
  const legacy = await validateApiKey(request, env);
  if (legacy.ok) return { ok: true, mode: 'admin', ...legacy };
  const tenant = await validateTenantKey(env, raw);
  if (tenant.ok) return { ok: true, mode: 'tenant', ...tenant };
  return { ok: false, error: 'invalid api key' };
}

async function auditLog(env, tenantId, action, resource = null, meta = null) {
  try {
    await env.DB.prepare(
      'INSERT INTO tenant_audit (tenant_id, action, resource, metadata) VALUES (?, ?, ?, ?)'
    ).bind(tenantId, action, resource, meta ? JSON.stringify(meta) : null).run();
  } catch {}
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });

    // ===== PUBLIC =====
    if (path === '/signup' && request.method === 'POST') return handleSignup(request, env);

    if (path === '/api/health') {
      return Response.json({
        status: 'ok', service: 'Argon SaaS', version: '2.0',
        features: ['chat','agent','swarm','webhooks','quotas','ratelimit','audit','docs','dashboard'],
        ts: Date.now()
      }, { headers: CORS });
    }

    if (path === '/docs' || path === '/docs/') {
      return new Response(renderDocs(), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }

    if (path === '/dashboard' || path === '/dashboard/') {
      return new Response(renderDashboard(), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }

    // ===== ADMIN (Basic Auth) =====
    if (path.startsWith('/admin')) {
      const basic = await validateBasicAuth(request, env);
      if (!basic.ok) return new Response('Auth required', { status: 401, headers: { 'WWW-Authenticate': 'Basic realm="Argon Admin"' } });
      if (path === '/admin/stats') return Response.json(await handleAdminStats(env), { headers: CORS });
      if (path === '/admin/tenants') return Response.json(await handleAdminTenants(env), { headers: CORS });
      if (path === '/admin/usage') return Response.json(await handleAdminUsage(env, url.searchParams.get('period')), { headers: CORS });
      if (path === '/admin/rotate-tenant-key' && request.method === 'POST') return handleAdminRotateKey(request, env);
      return new Response('Not Found', { status: 404 });
    }

    // ===== SWARM =====
    if (path.startsWith('/swarm')) {
      if (path === '/swarm' || path === '/swarm/') {
        const basic = await validateBasicAuth(request, env);
        if (!basic.ok) return new Response('Auth required', { status: 401, headers: { 'WWW-Authenticate': 'Basic realm="Argon Swarm"' } });
        return new Response(renderSwarmUI(), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
      }
      const auth = await authenticate(request, env);
      if (!auth.ok) return Response.json({ error: auth.error }, { status: 401, headers: CORS });

      if (auth.mode === 'tenant') {
        const rl = await checkRateLimit(env, auth.tenantId, auth.plan);
        if (!rl.ok) return Response.json({ error: 'rate limit exceeded', ...rl }, { status: 429, headers: { ...CORS, ...rateHeaders(rl) } });
        const q = await checkQuota(env, auth.tenantId, 'swarm');
        if (!q.ok) return Response.json({ error: q.error, quota: q }, { status: 429, headers: CORS });
        ctx.waitUntil(incrementUsage(env, auth.tenantId, 'swarm'));
        ctx.waitUntil(auditLog(env, auth.tenantId, 'swarm.evolve', path));
      }
      const id = env.SWARM_BRAIN.idFromName(resolveSwarmId(request, url));
      return env.SWARM_BRAIN.get(id).fetch(request);
    }

    // ===== LANDING =====
    if (path === '/' || path === '/landing') {
      const basic = await validateBasicAuth(request, env);
      if (!basic.ok) return new Response('Auth required', { status: 401, headers: { 'WWW-Authenticate': 'Basic realm="Argon"' } });
      return new Response(renderLanding(env), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }

    // ===== TENANT SELF-SERVICE =====
    if (path === '/api/me' && request.method === 'GET') {
      const auth = await authenticate(request, env);
      if (!auth.ok || auth.mode !== 'tenant') return Response.json({ error: 'tenant key required' }, { status: 401, headers: CORS });
      return handleMe(request, env, auth);
    }

    if (path === '/api/keys/rotate' && request.method === 'POST') {
      const auth = await authenticate(request, env);
      if (!auth.ok || auth.mode !== 'tenant') return Response.json({ error: 'tenant key required' }, { status: 401, headers: CORS });
      const res = await handleRotateKey(request, env, auth);
      ctx.waitUntil(auditLog(env, auth.tenantId, 'key.rotate'));
      return res;
    }

    if (path === '/api/keys/revoke' && request.method === 'POST') {
      const auth = await authenticate(request, env);
      if (!auth.ok || auth.mode !== 'tenant') return Response.json({ error: 'tenant key required' }, { status: 401, headers: CORS });
      const res = await handleRevokeKey(request, env, auth);
      ctx.waitUntil(auditLog(env, auth.tenantId, 'key.revoke'));
      return res;
    }

    // ===== WEBHOOKS =====
    if (path === '/api/webhooks' && request.method === 'GET') {
      const auth = await authenticate(request, env);
      if (!auth.ok || auth.mode !== 'tenant') return Response.json({ error: 'tenant key required' }, { status: 401, headers: CORS });
      return Response.json({ webhooks: await listWebhooks(env, auth.tenantId) }, { headers: CORS });
    }

    if (path === '/api/webhooks' && request.method === 'POST') {
      const auth = await authenticate(request, env);
      if (!auth.ok || auth.mode !== 'tenant') return Response.json({ error: 'tenant key required' }, { status: 401, headers: CORS });
      let body = {};
      try { body = await request.json(); } catch {}
      const res = await registerWebhook(env, auth.tenantId, body);
      ctx.waitUntil(auditLog(env, auth.tenantId, 'webhook.register', res.webhook_id, { url: body.url }));
      return Response.json(res, { status: res.ok ? 201 : 400, headers: CORS });
    }

    if (path.startsWith('/api/webhooks/') && request.method === 'DELETE') {
      const auth = await authenticate(request, env);
      if (!auth.ok || auth.mode !== 'tenant') return Response.json({ error: 'tenant key required' }, { status: 401, headers: CORS });
      const id = path.slice('/api/webhooks/'.length);
      const res = await deleteWebhook(env, auth.tenantId, id);
      ctx.waitUntil(auditLog(env, auth.tenantId, 'webhook.delete', id));
      return Response.json(res, { headers: CORS });
    }

    // ===== CHAT =====
    if (path === '/api/chat' && request.method === 'POST') {
      const auth = await authenticate(request, env);
      if (!auth.ok) return Response.json({ error: auth.error }, { status: 401, headers: CORS });

      let rl;
      if (auth.mode === 'tenant') {
        rl = await checkRateLimit(env, auth.tenantId, auth.plan);
        if (!rl.ok) return Response.json({ error: 'rate limit exceeded', ...rl }, { status: 429, headers: { ...CORS, ...rateHeaders(rl) } });
        const q = await checkQuota(env, auth.tenantId, 'chat');
        if (!q.ok) {
          ctx.waitUntil(dispatchEvent(env, auth.tenantId, 'quota.exceeded', { resource: 'chat', quota: q }));
          return Response.json({ error: q.error, quota: q }, { status: 429, headers: CORS });
        }
        if (q.used / q.limit >= 0.8) {
          ctx.waitUntil(dispatchEvent(env, auth.tenantId, 'quota.warning', { resource: 'chat', used: q.used, limit: q.limit }));
        }
        ctx.waitUntil(incrementUsage(env, auth.tenantId, 'chat'));
      }

      const res = await handleChat(request, env, ctx, auth);
      if (auth.mode === 'tenant') {
        ctx.waitUntil(auditLog(env, auth.tenantId, 'chat.completed'));
        ctx.waitUntil(dispatchEvent(env, auth.tenantId, 'chat.completed', { ts: Date.now() }));
      }
      return res;
    }

    // ===== AGENT =====
    if (path === '/api/agent' && request.method === 'POST') {
      const auth = await authenticate(request, env);
      if (!auth.ok) return Response.json({ error: auth.error }, { status: 401, headers: CORS });

      if (auth.mode === 'tenant') {
        if (auth.plan === 'free') {
          return Response.json({ error: 'agent access requires Starter plan or above', upgrade: true }, { status: 403, headers: CORS });
        }
        const rl = await checkRateLimit(env, auth.tenantId, auth.plan);
        if (!rl.ok) return Response.json({ error: 'rate limit exceeded', ...rl }, { status: 429, headers: { ...CORS, ...rateHeaders(rl) } });
        const q = await checkQuota(env, auth.tenantId, 'agent');
        if (!q.ok) return Response.json({ error: q.error, quota: q }, { status: 429, headers: CORS });
        ctx.waitUntil(incrementUsage(env, auth.tenantId, 'agent'));
      }

      const res = await handleAgent(request, env, ctx, auth);
      if (auth.mode === 'tenant') {
        ctx.waitUntil(auditLog(env, auth.tenantId, 'agent.completed'));
        ctx.waitUntil(dispatchEvent(env, auth.tenantId, 'agent.completed', { ts: Date.now() }));
      }
      return res;
    }

    // ===== SESSIONS =====
    if (path === '/api/sessions' && request.method === 'GET') {
      const auth = await authenticate(request, env);
      if (!auth.ok) return Response.json({ error: auth.error }, { status: 401, headers: CORS });
      const rows = await env.DB.prepare('SELECT id, title, created_at, updated_at FROM sessions ORDER BY updated_at DESC LIMIT 50').all();
      return Response.json({ sessions: rows.results || [] }, { headers: CORS });
    }

    return new Response('Not Found', { status: 404, headers: CORS });
  },

  async scheduled(event, env, ctx) {
    const SWARMS = ['GLOBAL_CORP_SWARM', 'SWARM_RESEARCH', 'SWARM_SECURITY'];
    const pick = SWARMS[Math.floor(Date.now() / 60000) % SWARMS.length];
    ctx.waitUntil(env.SWARM_BRAIN.get(env.SWARM_BRAIN.idFromName(pick)).fetch(new Request("https://internal/swarm/evolve", { method: "POST" })));

    // Cleanup old idempotency keys (> 24h)
    ctx.waitUntil(env.DB.prepare('DELETE FROM idempotency WHERE ts < ?').bind(Math.floor(Date.now()/1000) - 86400).run());
  }
};
