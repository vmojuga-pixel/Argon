import { renderLanding } from './web/landing.js';
import { renderSwarmUI } from './web/swarm-ui.js';
import { handleChat } from './api/chat.js';
import { handleAgent } from './api/agent.js';
import { validateApiKey, validateBasicAuth } from './auth/apikey.js';
import { SwarmBrain } from './swarm.js';

export { SwarmBrain };

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key, X-Swarm-ID',
};

function resolveSwarmId(request, url) {
  return url.searchParams.get('swarm') || request.headers.get('X-Swarm-ID') || 'GLOBAL_CORP_SWARM';
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });

    // ===== SWARM ROUTES — PROTECTED =====
    if (path.startsWith('/swarm')) {
      // Dashboard UI — Basic Auth
      if (path === '/swarm' || path === '/swarm/') {
        const basic = await validateBasicAuth(request, env);
        if (!basic.ok) {
          return new Response('Auth required', {
            status: 401,
            headers: { 'WWW-Authenticate': 'Basic realm="Argon Swarm"' }
          });
        }
        return new Response(renderSwarmUI(), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
      }

      // API endpoints — X-API-Key
      const auth = await validateApiKey(request, env);
      if (!auth.ok) return Response.json({ error: auth.error }, { status: 401, headers: CORS });

      const swarmId = resolveSwarmId(request, url);
      const id = env.SWARM_BRAIN.idFromName(swarmId);
      return env.SWARM_BRAIN.get(id).fetch(request);
    }

    // ===== ARGON ROUTES =====
    if (path === '/' || path === '/landing') {
      const basic = await validateBasicAuth(request, env);
      if (!basic.ok) {
        return new Response('Auth required', {
          status: 401,
          headers: { 'WWW-Authenticate': 'Basic realm="Argon"' }
        });
      }
      return new Response(renderLanding(env), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }

    if (path === '/api/health') {
      return Response.json({ status: 'ok', service: 'Argon', protected: true, ts: Date.now() }, { headers: CORS });
    }

    if (path === '/api/chat' && request.method === 'POST') {
      const auth = await validateApiKey(request, env);
      if (!auth.ok) return Response.json({ error: auth.error }, { status: 401, headers: CORS });
      return handleChat(request, env, ctx, auth);
    }

    if (path === '/api/agent' && request.method === 'POST') {
      const auth = await validateApiKey(request, env);
      if (!auth.ok) return Response.json({ error: auth.error }, { status: 401, headers: CORS });
      return handleAgent(request, env, ctx, auth);
    }

    if (path === '/api/sessions' && request.method === 'GET') {
      const auth = await validateApiKey(request, env);
      if (!auth.ok) return Response.json({ error: auth.error }, { status: 401, headers: CORS });
      const rows = await env.DB.prepare('SELECT id, title, created_at, updated_at FROM sessions ORDER BY updated_at DESC LIMIT 50').all();
      return Response.json({ sessions: rows.results || [] }, { headers: CORS });
    }

    return new Response('Not Found', { status: 404, headers: CORS });
  },

  async scheduled(event, env, ctx) {
    const SWARMS = ['GLOBAL_CORP_SWARM', 'SWARM_RESEARCH', 'SWARM_SECURITY'];
    const pick = SWARMS[Math.floor(Date.now() / 60000) % SWARMS.length];
    const id = env.SWARM_BRAIN.idFromName(pick);
    ctx.waitUntil(env.SWARM_BRAIN.get(id).fetch(new Request("https://internal/swarm/evolve", { method: "POST" })));
  }
};
