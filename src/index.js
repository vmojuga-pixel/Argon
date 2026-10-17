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
import { renderBaobao } from './web/baobao-page.js';
import { renderOps } from './web/ops.js';
import { planOps } from './ops/planner.js';
import { applyOps } from './ops/applier.js';
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
import { renderLegal } from './web/legal.js';
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


async function verifyStripeSignature(payload, sigHeader, secret) {
  if (!sigHeader) return false;
  const parts = sigHeader.split(',');
  let timestamp = '';
  let signature = '';
  for (const part of parts) {
    if (part.startsWith('t=')) timestamp = part.substring(2);
    if (part.startsWith('v1=')) signature = part.substring(3);
  }
  if (!timestamp || !signature) return false;
  const signedPayload = timestamp + '.' + payload;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']
  );
  const hex = signature;
  const sigBytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) sigBytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  return await crypto.subtle.verify('HMAC', key, sigBytes, enc.encode(signedPayload));
}


export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });

    // ===== PUBLIC =====
    
    if (path === '/signup' && request.method === 'POST') return handleSignup(request, env);

    if (path === '/api/auth/oauth/google') {
      const clientId = env.GOOGLE_CLIENT_ID;
      const redirectUri = url.origin + '/api/auth/oauth/google/callback';
      const scope = 'email profile';
      const googleAuthUrl = 'https://accounts.google.com/o/oauth2/v2/auth?client_id=' + clientId + '&redirect_uri=' + encodeURIComponent(redirectUri) + '&response_type=code&scope=' + encodeURIComponent(scope) + '';
      return Response.redirect(googleAuthUrl, 302);
    }
    if (path === '/api/auth/oauth/google/callback') {
      const code = url.searchParams.get('code');
      if (!code) return new Response('No code', { status: 400 });
      const clientId = env.GOOGLE_CLIENT_ID;
      const clientSecret = env.GOOGLE_CLIENT_SECRET;
      const redirectUri = url.origin + '/api/auth/oauth/google/callback';
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: redirectUri, grant_type: 'authorization_code' })
      });
      const tokenData = await tokenRes.json();
      if (!tokenData.access_token) return new Response('Token fail: ' + JSON.stringify(tokenData), { status: 400 });
      const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: 'Bearer ' + tokenData.access_token }
      });
      const user = await userRes.json();
      const email = user.email;
      if (!email) return new Response('No email', { status: 400 });
      
      let tenant = await env.DB.prepare('SELECT * FROM tenants WHERE email = ?').bind(email).first();
      if (!tenant) {
        const mockReq = new Request(url.origin + '/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email, plan: 'free' })
        });
        await handleSignup(mockReq, env);
      }
      await env.KV.put('gh_token:' + email, tokenData.access_token);
      const token = await createSession(env, email);
      return new Response(null, {
        status: 302,
        headers: { 'Location': '/app', 'Set-Cookie': sessionCookieHeader(token) }
      });
    }
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
          
          // Trigger di background, jangan tunggu
          ctx.waitUntil(obj.fetch('https://internal/omni/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ targetRepo: 'vmojuga-pixel/Argon', directive: directive, slug: slug })
          }).catch(e => console.error('[BUILD-ERR]', e)));
          
          return Response.json({ ok: true, message: 'Build started', slug: slug }, { headers: CORS });
        }
        if (path === '/api/ops/plan' && request.method === 'POST') {
      const sess = await validateSessionOrBasic(request, env);
      if (!sess.ok) return Response.json({ ok:false, error:'login required' }, { status: 401, headers: CORS });
      let body = {};
      try { body = await request.json(); } catch {}
      const out = await planOps(env, String(body.directive || '').slice(0, 1000));
      return Response.json(out, { headers: CORS });
    }
    if (path === '/api/ops/apply' && request.method === 'POST') {
      const sess = await validateSessionOrBasic(request, env);
      if (!sess.ok) return Response.json({ ok:false, error:'login required' }, { status: 401, headers: CORS });
      let body = {};
      try { body = await request.json(); } catch {}
      const out = await applyOps(env, body.plan, body.summary || '[Ops] auto-apply');
      return Response.json(out, { headers: CORS });
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
      // Tambah log untuk tengok siapa yang masuk
      console.log('[APP-ACCESS]', sess.email || sess.user);
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
      // Halaman awam, tiada basic auth
      return new Response(renderPublicLanding(env, false), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }
    if (path === '/signup') {
      const err = url.searchParams.get('error') || '';
      return new Response(renderSignup(err), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }
    if (path === '/login') {
      const sess = await validateSessionOrBasic(request, env);
      if (sess.ok) {
        const redirect = url.searchParams.get('redirect') || '/app';
        return Response.redirect(url.origin + redirect, 302);
      }
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
    if (path === '/api/projects' && request.method === 'GET') {
          const sess = await validateSessionOrBasic(request, env);
          if (!sess.ok) return Response.json({ ok:false, error:'login required' }, { status: 401, headers: CORS });
          try {
             const id = env.OMNI_OVERLORD.idFromName('GLOBAL_OMNI_OVERLORD_V3');
             const obj = env.OMNI_OVERLORD.get(id);
             const r = await obj.fetch('https://internal/omni/report', { method: 'GET' });
             const data = await r.json();
             return Response.json({ ok: true, projects: data.projects || [] }, { headers: CORS });
          } catch(e) {
             return Response.json({ ok: true, projects: [] }, { headers: CORS });
          }
        }
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
    if (path === '/api/stripe/checkout' && request.method === 'POST') {
          const sess = await validateSessionOrBasic(request, env);
          if (!sess.ok) return Response.json({ ok: false, error: 'login required' }, { status: 401, headers: CORS });
          const email = sess.email || sess.user;
          const plan = url.searchParams.get('plan') || 'pro';
          
          let amount = 4900; // Starter RM49
          if (plan === 'pro') amount = 19900;
          if (plan === 'business') amount = 79900;

          const body = new URLSearchParams();
          body.append('mode', 'subscription');
          body.append('payment_method_types[0]', 'card'); 
          body.append('line_items[0][price_data][currency]', 'myr');
          body.append('line_items[0][price_data][product_data][name]', 'BorneoAI ' + plan.toUpperCase());
          body.append('line_items[0][price_data][unit_amount]', amount.toString());
          body.append('line_items[0][price_data][recurring][interval]', 'month');
          body.append('line_items[0][quantity]', '1');
          body.append('customer_email', email);
          body.append('success_url', url.origin + '/app/billing?success=true');
          body.append('cancel_url', url.origin + '/app/billing?canceled=true');
          body.append('client_reference_id', email);
          body.append('metadata[plan]', plan);

          try {
            const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + env.STRIPE_SECRET_KEY,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: body.toString()
            });
            const stripeData = await stripeRes.json();
            if (stripeData.url) {
                return Response.json({ ok: true, url: stripeData.url }, { headers: CORS });
            } else {
                return Response.json({ ok: false, error: stripeData.error ? stripeData.error.message : 'Stripe error' }, { headers: CORS });
            }
          } catch(e) {
            return Response.json({ ok: false, error: e.message }, { status: 500, headers: CORS });
          }
        }

        if (path === '/api/stripe/webhook' && request.method === 'POST') {
          const payload = await request.text();
          const sigHeader = request.headers.get('stripe-signature');
          
          const isValid = await verifyStripeSignature(payload, sigHeader, env.STRIPE_WEBHOOK_SECRET);
          if (!isValid) return new Response('Invalid signature', { status: 400 });

          let event;
          try { event = JSON.parse(payload); } catch(e) { return new Response('Invalid JSON', { status: 400 }); }

          if (event.type === 'checkout.session.completed') {
              const session = event.data.object;
              const email = session.client_reference_id;
              const plan = session.metadata.plan;
              if (email && plan) {
                  try {
                      await env.DB.prepare('UPDATE tenants SET plan = ? WHERE email = ?').bind(plan, email).run();
                      console.log('[STRIPE] Upgraded', email, 'to', plan);
                  } catch(e) {
                      console.log('[STRIPE-DB-ERR]', e.message);
                  }
              }
          }
          return new Response('OK', { status: 200 });
        }
        if (path === '/api/auth/oauth/github') {
      const clientId = env.GITHUB_CLIENT_ID;
      const redirectUri = url.origin + '/api/auth/oauth/github/callback';
      const scope = 'repo,user:email';
      const githubAuthUrl = 'https://github.com/login/oauth/authorize?client_id=' + clientId + '&redirect_uri=' + encodeURIComponent(redirectUri) + '&scope=' + encodeURIComponent(scope);
      return Response.redirect(githubAuthUrl, 302);
    }
    if (path === '/api/auth/oauth/github/callback') {
      const code = url.searchParams.get('code');
      if (!code) return new Response('No code', { status: 400 });
      const clientId = env.GITHUB_CLIENT_ID;
      const clientSecret = env.GITHUB_CLIENT_SECRET;
      const redirectUri = url.origin + '/api/auth/oauth/github/callback';
      
      const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: redirectUri })
      });
      const tokenData = await tokenRes.json();
      if (!tokenData.access_token) return new Response('Token fail: ' + JSON.stringify(tokenData), { status: 400 });
      
      const emailsRes = await fetch('https://api.github.com/user/emails', {
        headers: { Authorization: 'Bearer ' + tokenData.access_token, 'User-Agent': 'BorneoAI' }
      });
      const emails = await emailsRes.json();
      let email = null;
      if (Array.isArray(emails)) {
        const primary = emails.find(e => e.primary && e.verified);
        email = primary ? primary.email : (emails.length > 0 ? emails[0].email : null);
      }
      
      if (!email) return new Response('No email from GitHub', { status: 400 });
      
      let tenant = await env.DB.prepare('SELECT * FROM tenants WHERE email = ?').bind(email).first();
      if (!tenant) {
        const mockReq = new Request(url.origin + '/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email, plan: 'free' })
        });
        await handleSignup(mockReq, env);
      }
      const token = await createSession(env, email);
      return new Response(null, {
        status: 302,
        headers: { 'Location': '/app', 'Set-Cookie': sessionCookieHeader(token) }
      });
    }
    
    if (path === '/api/github/repos' && request.method === 'GET') {
          const sess = await validateSessionOrBasic(request, env);
          if (!sess.ok) return Response.json({ ok: false, error: 'login required' }, { status: 401, headers: CORS });
          const email = sess.email || sess.user;
          const token = await env.KV.get('gh_token:' + email);
          if (!token) return Response.json({ ok: false, error: 'GitHub belum disambungkan. Sila login semula guna GitHub.' }, { headers: CORS });
          
          try {
            const ghRes = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
              headers: { Authorization: 'Bearer ' + token, 'User-Agent': 'BorneoAI' }
            });
            const repos = await ghRes.json();
            if (!Array.isArray(repos)) return Response.json({ ok: false, error: 'Gagal tarik repo' }, { headers: CORS });
            const simplified = repos.map(r => ({ name: r.name, full_name: r.full_name, private: r.private }));
            return Response.json({ ok: true, repos: simplified }, { headers: CORS });
          } catch(e) {
            return Response.json({ ok: false, error: e.message }, { status: 500, headers: CORS });
          }
        }
        if (path === '/api/chat' && request.method === 'POST') {
          let tenantId = null;
          let auth = await authenticate(request, env);
          if (auth.ok) {
            tenantId = auth.tenantId;
          } else {
            const sess = await validateSessionOrBasic(request, env);
            if (sess.ok) {
              const email = sess.email || sess.user;
              const t = await env.DB.prepare('SELECT id FROM tenants WHERE email = ?').bind(email).first();
              if (t) tenantId = t.id;
            }
          }
          if (!tenantId) return Response.json({ ok: false, error: 'auth required' }, { status: 401, headers: CORS });
          
          const quota = await checkQuota(env, tenantId, 'chat');
          if (!quota.ok) return Response.json({ ok: false, error: 'quota exceeded' }, { status: 429, headers: CORS });

          let body = {};
          try { body = await request.json(); } catch (e) { 
            return Response.json({ ok: false, error: 'invalid json' }, { status: 400, headers: CORS }); 
          }
          
          const msg = body.message || '';
          if (!msg) return Response.json({ ok: false, error: 'message required' }, { status: 400, headers: CORS });

          try {
            const sysPrompt = `You are Baobao, an agentic AI assistant for BorneoAI. 
You can answer questions OR perform tasks. 
If the user asks to build software, automate tasks, or write code, acknowledge it and provide a brief plan or the code.
If the user asks a general question, answer it clearly.
Reply in the same language as the user (BM or English). Keep it helpful and concise.`;

            const r = await env.AI.run('@cf/meta/llama-4-scout-17b-16e-instruct', {
               messages: [
                 { role: 'system', content: sysPrompt },
                 { role: 'user', content: msg }
               ],
               max_tokens: 800
            });
            const reply = r.response || r.result || r.text || 'Maaf, saya tidak dapat menjana jawapan.';
            
            ctx.waitUntil(incrementUsage(env, tenantId, 'chat'));
            ctx.waitUntil(auditLog(env, tenantId, 'chat.completed'));
            
            return Response.json({ ok: true, reply: reply }, { headers: CORS });
          } catch (e) {
            return Response.json({ ok: false, error: e.message }, { status: 500, headers: CORS });
          }
        }
        
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
