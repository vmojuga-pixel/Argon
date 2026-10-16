import { renderLanding } from './web/landing.js';
import { renderSwarmUI } from './web/swarm-ui.js';
import { renderDashboard } from './web/dashboard.js';
import { renderDocs } from './web/docs.js';
import { handleChat } from './api/chat.js';
import { handleAgent } from './api/agent.js';
import { validateApiKey, validateBasicAuth } from './auth/apikey.js';
import { createSession, validateSessionOrBasic, verifyLogin, sessionCookieHeader, clearCookieHeader } from './auth/session.js';
import { renderLogin } from './web/login.js';
import { renderSignup } from './web/signup.js';
import { renderApp } from './web/app.js';
import { renderPublicLanding } from './web/landing-public.js';
import { SwarmBrain } from './swarm.js';
import { OverlordSeniorDev } from './overlord.js';
import { OmniOverlordEngine } from './omni-overlord.js';
import { renderOverlordUI } from './web/overlord-ui.js';
import { renderOmniUI } from './web/omni-ui.js';
import { validateTenantKey, checkQuota, incrementUsage } from './saas/tenant.js';
import { checkRateLimit, rateHeaders } from './saas/ratelimit.js';
import { registerWebhook, listWebhooks, deleteWebhook, dispatchEvent } from './saas/webhooks.js';
import { handleSignup, handleMe, handleRotateKey, handleRevokeKey } from './saas/signup.js';
import { handleAdminStats, handleAdminTenants, handleAdminUsage } from './admin/stats.js';
import { analyzePayload as reconAnalyze, renderReconUI } from './tools/recon.js';
import { handleAdminRotateKey } from './admin/recover.js';
import { renderStatus } from './web/status.js';
import { renderLegal, TERMS_HTML, PRIVACY_HTML, AUP_HTML, COOKIE_HTML } from './web/legal.js';
import { generateSDKForSector, listSectors } from './tools/sdk-gen.js';

export { SwarmBrain, OverlordSeniorDev, OmniOverlordEngine };

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
    if (path === '/signup' && request.method === 'GET') {
      return Response.redirect(url.origin + '/login?signup=1', 302);
    }
    if (path === '/signup' && request.method === 'POST') return handleSignup(request, env);

    if (path === '/api/build' && request.method === 'POST') {
      const sess = await validateSessionOrBasic(request, env);
      if (!sess.ok) return Response.json({ ok:false, error:'login required' }, { status: 401, headers: CORS });
      let body = {};
      try { body = await request.json(); } catch {}
      const directive = String(body.directive || '').slice(0, 800).trim();
      const slug = String(body.slug || ('app-' + Date.now().toString(36))).slice(0, 40);
      if (!directive) return Response.json({ ok:false, error:'directive required' }, { headers: CORS });
      const id = env.OMNI_OVERLORD.idFromName('GLOBAL_OMNI_OVERLORD_V3');
      const obj = env.OMNI_OVERLORD.get(id);
      const r = await obj.fetch('https://internal/omni/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetRepo: 'vmojuga-pixel/Argon', directive: directive, slug: slug })
      });
      const data = await r.json();
      return Response.json(data, { headers: CORS });
    }
    if (path === '/api/baobao' && request.method === 'POST') {
      const ip = request.headers.get('cf-connecting-ip') || 'unknown';
      const today = new Date().toISOString().slice(0,10);
      const key = 'baobao:' + ip + ':' + today;
      const LIMIT = 5;
      let used = 0;
      try { used = parseInt((await env.KV.get(key)) || '0', 10) || 0; } catch {}
      if (used >= LIMIT) {
        return Response.json({ ok:false, error:'limit_reached', used: used, limit: LIMIT, message: 'Limit 5 chat/hari. Sign up untuk unlimited.' }, { headers: CORS });
      }
      let body = {};
      try { body = await request.json(); } catch {}
      const msg = String(body.message || '').slice(0, 500).trim();
      if (!msg) return Response.json({ ok:false, error:'empty' }, { headers: CORS });
      const sys = 'Kau Baobao, chatbot rasmi BorneoAI. Jawab mesra, ringkas (max 3 baris), dalam BM atau ikut bahasa user. Kalau tak pasti, suruh sign up atau email sales@northerncoastgroup.com.\n\nFakta:\n- BorneoAI = platform autocode AI untuk bisnes (enterprise, startup, SME, non-tech).\n- User taip arahan (BM/EN), AI bina website, SaaS, API, automation agentic, full-stack, deploy ke edge.\n- Harga: Free RM0 (100 chat/bln, 1 project), Starter RM49/bln, Pro RM199/bln, Business RM799/bln, Enterprise custom.\n- Daftar free di /signup. Docs di /docs.\n- Guna 7-ejen Swarm untuk fikir, kritik, optimize kod.\n- Bayar via TnG eWallet. Batal bila-bila.';
      let reply = 'Maaf, Baobao tengah rehat. Cuba lagi nanti.';
      try {
        const r = await env.AI.run('@cf/meta/llama-4-scout-17b-16e-instruct', {
          messages: [ { role:'system', content: sys }, { role:'user', content: msg } ],
          max_tokens: 200,
          temperature: 0.4
        });
        reply = (r.response || r.result || r.text || '').trim() || reply;
      } catch (e) { console.log('[BAOBAO-ERR]', e.message); }
      try { await env.KV.put(key, String(used + 1), { expirationTtl: 86400 }); } catch {}
      return Response.json({ ok:true, reply: reply, used: used + 1, remaining: LIMIT - used - 1, limit: LIMIT }, { headers: CORS });
    }
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

    if (path === '/app' || path.startsWith('/app/')) {
      const sess = await validateSessionOrBasic(request, env);
      if (!sess.ok) return Response.redirect(url.origin + '/login', 302);
      const v = path.split('/')[2] || 'home';
      return new Response(renderApp(env, sess, v), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
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
    if (path === '/api/debug/email' && request.method === 'POST') {
      const auth = await authenticate(request, env);
      if (!auth.ok) return Response.json({ error: auth.error }, { status: 401, headers: CORS });
      let body = {};
      try { body = await request.json(); } catch {}
      const { sendEmail } = await import('./emails/sender.js');
      const result = await sendEmail(env, {
        to: body.to || 'test@example.com',
        subject: 'Argon debug test',
        html: '<h1>Debug</h1><p>Test from Argon.</p>',
        text: 'Debug test from Argon.'
      });
      return Response.json({
        env_has_email: !!env.EMAIL,
        email_from: env.EMAIL_FROM || '(default)',
        result: result,
        ts: Date.now()
      }, { headers: CORS });
    }

    // ===== SDK GEN =====
    if (path === '/api/sdk-sectors' && request.method === 'GET') {
      return Response.json({ sectors: listSectors() }, { headers: CORS });
    }
    if (path.startsWith('/api/sdk-gen/') && request.method === 'GET') {
      const sector = path.slice('/api/sdk-gen/'.length);
      const snippets = generateSDKForSector(sector);
      if (!snippets) return Response.json({ error: 'unknown sector', valid: listSectors() }, { status: 404, headers: CORS });
      return Response.json({ sector, snippets }, { headers: CORS });
    }

    // ===== STATUS PAGE =====
    if (path === '/status' || path === '/status/') {
      const startT = Date.now();
      const checks = [];
      // DB check
      try {
        const dbT = Date.now();
        await env.DB.prepare('SELECT 1').first();
        checks.push({ name: 'D1 Database', ok: true, detail: `${Date.now() - dbT}ms` });
      } catch (e) { checks.push({ name: 'D1 Database', ok: false, detail: String(e) }); }
      // KV check
      try {
        const kvT = Date.now();
        await env.KV.put('__status_ping', String(Date.now()), { expirationTtl: 60 });
        checks.push({ name: 'KV Namespace', ok: true, detail: `${Date.now() - kvT}ms` });
      } catch (e) { checks.push({ name: 'KV Namespace', ok: false, detail: String(e) }); }
      // R2 check
      try {
        const r2T = Date.now();
        await env.AUDIT.head('__status_ping');
        checks.push({ name: 'R2 Bucket', ok: true, detail: `${Date.now() - r2T}ms` });
      } catch (e) { checks.push({ name: 'R2 Bucket', ok: true, detail: 'writable (no head)' }); }
      // AI binding
      checks.push({ name: 'Workers AI', ok: !!env.AI, detail: env.AI ? 'bound' : 'missing' });
      // Durable Objects
      checks.push({ name: 'Durable Objects', ok: !!env.SWARM_BRAIN && !!env.OVERLORD_BRAIN && !!env.OMNI_OVERLORD, detail: 'swarm + overlord + omni' });
      checks.push({ name: 'API Gateway', ok: true, detail: `${Date.now() - startT}ms` });
      return new Response(renderStatus(env, checks), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }

    // ===== STATUS JSON =====
    if (path === '/api/status') {
      const checks = { db: false, kv: false, r2: false, ai: !!env.AI, do: !!env.SWARM_BRAIN };
      try { await env.DB.prepare('SELECT 1').first(); checks.db = true; } catch {}
      try { await env.KV.put('__p', '1', { expirationTtl: 60 }); checks.kv = true; } catch {}
      try { await env.AUDIT.put('__p', '1'); checks.r2 = true; } catch {}
      return Response.json({ ok: Object.values(checks).every(v => v), checks, ts: Date.now() }, { headers: CORS });
    }

    // ===== LEGAL PAGES =====
    const LEGAL = {
      '/legal/terms': 'terms-of-service.md',
      '/legal/privacy': 'privacy-policy.md',
      '/legal/aup': 'acceptable-use-policy.md',
      '/legal/cookies': 'cookie-policy.md',
      '/terms': 'terms-of-service.md',
      '/privacy': 'privacy-policy.md',
    };
    if (LEGAL[path]) {
      // Serve embedded HTML version (no file read at edge)
      if (path === '/legal/terms' || path === '/terms') {
        return new Response(renderLegal('Terms of Service', TERMS_HTML), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
      }
      if (path === '/legal/privacy' || path === '/privacy') {
        return new Response(renderLegal('Privacy Policy', PRIVACY_HTML), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
      }
      if (path === '/legal/aup') {
        return new Response(renderLegal('Acceptable Use Policy', AUP_HTML), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
      }
      if (path === '/legal/cookies') {
        return new Response(renderLegal('Cookie Policy', COOKIE_HTML), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
      }
    }

    // ===== PUBLIC LANDING + LOGIN =====
    if (path === '/' || path === '/landing') {
      const sess = await validateSessionOrBasic(request, env);
      return new Response(renderPublicLanding(env, sess.ok), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }
    if (path === '/signup') {
      const err = url.searchParams.get('error') || '';
      return new Response(renderSignup(err), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }
    if (path === '/login') {
      const err = url.searchParams.get('error') || '';
      return new Response(renderLogin(err), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }
    if (path === '/api/auth/login' && request.method === 'POST') {
      let body = {};
      try { body = await request.json(); } catch {}
      const user = (body.user || '').trim();
      const pass = (body.pass || '');
      const ok = await verifyLogin(env, user, pass);
      if (!ok) return Response.json({ ok: false, error: 'Invalid credentials' }, { status: 401, headers: CORS });
      const token = await createSession(env, user);
      return new Response(JSON.stringify({ ok: true, redirect: body.redirect || '/app' }), {
        status: 200,
        headers: { ...CORS, 'Content-Type': 'application/json', 'Set-Cookie': sessionCookieHeader(token) }
      });
    }
    if (path === '/api/auth/logout' && request.method === 'POST') {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...CORS, 'Content-Type': 'application/json', 'Set-Cookie': clearCookieHeader() }
      });
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

    // ===== RECON (public UI, tenant-protected API) =====
    if (path === '/recon' || path === '/recon/') {
      const basic = await validateBasicAuth(request, env);
      if (!basic.ok) return new Response('Auth required', { status: 401, headers: { 'WWW-Authenticate': 'Basic realm="Recon"' } });
      return new Response(renderReconUI(), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }
    if (path === '/api/recon' && request.method === 'POST') {
      const auth = await authenticate(request, env);
      if (!auth.ok) return Response.json({ error: auth.error }, { status: 401, headers: CORS });
      if (auth.mode === 'tenant') {
        const rl = await checkRateLimit(env, auth.tenantId, auth.plan);
        if (!rl.ok) return Response.json({ error: 'rate limit exceeded' }, { status: 429, headers: { ...CORS, ...rateHeaders(rl) } });
      }
      let body = {};
      try { body = await request.json(); } catch {}
      const result = reconAnalyze(body.target_type || 'CODE_SNIPPET', body.payload || '');
      return Response.json(result, { headers: CORS });
    }

    // ===== OVERLORD (Tier-1 Senior Dev) =====
    if (path === '/overlord-ui' || path === '/overlord-ui/') {
      const sess = await validateSessionOrBasic(request, env);
      if (!sess.ok) return Response.redirect(url.origin + '/login?error=' + encodeURIComponent('Auth required') + '&redirect=' + encodeURIComponent(path), 302);
      return new Response(renderOverlordUI(), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }
    if (path.startsWith('/overlord')) {
      const auth = await authenticate(request, env);
      if (!auth.ok) return Response.json({ error: auth.error }, { status: 401, headers: CORS });
      if (auth.mode === 'tenant') {
        const rl = await checkRateLimit(env, auth.tenantId, auth.plan);
        if (!rl.ok) return Response.json({ error: 'rate limit exceeded' }, { status: 429, headers: { ...CORS, ...rateHeaders(rl) } });
      }
      const id = env.OVERLORD_BRAIN.idFromName('GLOBAL_SENIOR_DEV_OVERLORD_V2');
      return env.OVERLORD_BRAIN.get(id).fetch(request);
    }

    // ===== OMNI-OVERLORD (Universal multi-repo) =====
    if (path.startsWith('/omni/')) {
      const auth = await authenticate(request, env);
      if (!auth.ok) return Response.json({ error: auth.error }, { status: 401, headers: CORS });
      if (auth.mode === 'tenant') {
        const rl = await checkRateLimit(env, auth.tenantId, auth.plan);
        if (!rl.ok) return Response.json({ error: 'rate limit exceeded' }, { status: 429, headers: { ...CORS, ...rateHeaders(rl) } });
      }
      const id = env.OMNI_OVERLORD.idFromName('GLOBAL_OMNI_OVERLORD_V3');
      return env.OMNI_OVERLORD.get(id).fetch(request);
    }

    if (path === '/app' || path === '/omni-ui/') {
      const sess = await validateSessionOrBasic(request, env);
      if (!sess.ok) return Response.redirect(url.origin + '/login?error=' + encodeURIComponent('Auth required') + '&redirect=' + encodeURIComponent(path), 302);
      return new Response(renderOmniUI(), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }

    return new Response('Not Found', { status: 404, headers: CORS });
  },

  async scheduled(event, env, ctx) {
    // Overlord maintenance sweep (setiap cron tick)
// [DISABLED-BY-SIR]     ctx.waitUntil(env.OVERLORD_BRAIN.get(env.OVERLORD_BRAIN.idFromName('GLOBAL_SENIOR_DEV_OVERLORD_V2')).fetch(new Request('https://internal/overlord/maintain', { method: 'POST' })));
// [DISABLED-BY-SIR]     ctx.waitUntil(env.OMNI_OVERLORD.get(env.OMNI_OVERLORD.idFromName('GLOBAL_OMNI_OVERLORD_V3')).fetch(new Request('https://internal/omni/watchdog', { method: 'POST' })));

    const SWARMS = ['GLOBAL_CORP_SWARM', 'SWARM_RESEARCH', 'SWARM_SECURITY'];
    const pick = SWARMS[Math.floor(Date.now() / 60000) % SWARMS.length];
    ctx.waitUntil(env.SWARM_BRAIN.get(env.SWARM_BRAIN.idFromName(pick)).fetch(new Request("https://internal/swarm/evolve", { method: "POST" })));

    // Cleanup old idempotency keys (> 24h)
    ctx.waitUntil(env.DB.prepare('DELETE FROM idempotency WHERE ts < ?').bind(Math.floor(Date.now()/1000) - 86400).run());
  }
};
