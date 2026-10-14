import { renderLanding } from './web/landing.js';
import { renderSwarmUI } from './web/swarm-ui.js';
import { handleChat } from './api/chat.js';
import { handleAgent } from './api/agent.js';
import { validateApiKey, validateBasicAuth } from './auth/apikey.js';
import { SwarmBrain } from './swarm.js';
import { validateTenantKey, checkQuota, incrementUsage } from './saas/tenant.js';
import { handleSignup, handleMe, handleRotateKey, handleRevokeKey } from './saas/signup.js';

export { SwarmBrain };

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key, X-Swarm-ID',
};

function resolveSwarmId(request, url) {
  return url.searchParams.get('swarm') || request.headers.get('X-Swarm-ID') || 'GLOBAL_CORP_SWARM';
}

// Unified auth: try tenant key first, fallback to legacy admin key
async function authenticate(request, env) {
  const raw = (request.headers.get('x-api-key') || '').trim();
  if (!raw) return { ok: false, error: 'missing api key' };

  // Legacy admin path
  const legacy = await validateApiKey(request, env);
  if (legacy.ok) return { ok: true, mode: 'admin', ...legacy };

  // SaaS tenant path
  const tenant = await validateTenantKey(env, raw);
  if (tenant.ok) return { ok: true, mode: 'tenant', ...tenant };

  return { ok: false, error: 'invalid api key' };
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });

    // ===== PUBLIC SAAS ENDPOINTS =====
    if (path === '/signup' && request.method === 'POST') return handleSignup(request, env);

    if (path === '/api/health') {
      return Response.json({
        status: 'ok', service: 'Argon SaaS', version: '2.0',
        endpoints: ['/signup', '/api/chat', '/api/agent', '/swarm/*', '/api/me'],
        ts: Date.now()
      }, { headers: CORS });
    }

    // ===== SWARM (protected) =====
    if (path.startsWith('/swarm')) {
      if (path === '/swarm' || path === '/swarm/') {
        const basic = await validateBasicAuth(request, env);
        if (!basic.ok) return new Response('Auth required', { status: 401, headers: { 'WWW-Authenticate': 'Basic realm="Argon Swarm"' } });
        return new Response(renderSwarmUI(), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
      }
      const auth = await authenticate(request, env);
      if (!auth.ok) return Response.json({ error: auth.error }, { status: 401, headers: CORS });

      // Quota check for swarm
      if (auth.mode === 'tenant') {
        const q = await checkQuota(env, auth.tenantId, 'swarm');
        if (!q.ok) return Response.json({ error: q.error, quota: q }, { status: 429, headers: CORS });
        ctx.waitUntil(incrementUsage(env, auth.tenantId, 'swarm'));
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
      return handleRotateKey(request, env, auth);
    }
    if (path === '/api/keys/revoke' && request.method === 'POST') {
      const auth = await authenticate(request, env);
      if (!auth.ok || auth.mode !== 'tenant') return Response.json({ error: 'tenant key required' }, { status: 401, headers: CORS });
      return handleRevokeKey(request, env, auth);
    }

    // ===== CHAT / AGENT (quota-aware) =====
    if (path === '/api/chat' && request.method === 'POST') {
      const auth = await authenticate(request, env);
      if (!auth.ok) return Response.json({ error: auth.error }, { status: 401, headers: CORS });
      if (auth.mode === 'tenant') {
        const q = await checkQuota(env, auth.tenantId, 'chat');
        if (!q.ok) return Response.json({ error: q.error, quota: q }, { status: 429, headers: CORS });
        ctx.waitUntil(incrementUsage(env, auth.tenantId, 'chat'));
      }
      return handleChat(request, env, ctx, auth);
    }

    if (path === '/api/agent' && request.method === 'POST') {
      const auth = await authenticate(request, env);
      if (!auth.ok) return Response.json({ error: auth.error }, { status: 401, headers: CORS });
      if (auth.mode === 'tenant') {
        if (!auth.scopes.includes('agent') && auth.plan === 'free') {
          return Response.json({ error: 'agent access requires Starter plan or above', upgrade: true }, { status: 403, headers: CORS });
        }
        const q = await checkQuota(env, auth.tenantId, 'agent');
        if (!q.ok) return Response.json({ error: q.error, quota: q }, { status: 429, headers: CORS });
        ctx.waitUntil(incrementUsage(env, auth.tenantId, 'agent'));
      }
      return handleAgent(request, env, ctx, auth);
    }

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
  }
};
