export function renderDocs() {
  const endpoints = [
    { m:'POST', p:'/signup', d:'Create new tenant + return API key', auth:'public', body:'{ email, company?, plan? }' },
    { m:'GET',  p:'/api/me', d:'Tenant info + current usage + quota', auth:'tenant' },
    { m:'POST', p:'/api/chat', d:'LLM chat completion', auth:'tenant', body:'{ session_id?, message, history? }' },
    { m:'POST', p:'/api/agent', d:'Agentic tool-calling loop', auth:'tenant', body:'{ session_id?, message }' },
    { m:'GET',  p:'/api/sessions', d:'List your chat sessions', auth:'tenant' },
    { m:'POST', p:'/api/keys/rotate', d:'Generate new API key', auth:'tenant' },
    { m:'POST', p:'/api/keys/revoke', d:'Revoke key by prefix', auth:'tenant', body:'{ prefix }' },
    { m:'POST', p:'/api/webhooks', d:'Register webhook URL', auth:'tenant', body:'{ url, events[] }' },
    { m:'GET',  p:'/api/webhooks', d:'List your webhooks', auth:'tenant' },
    { m:'DELETE', p:'/api/webhooks/:id', d:'Delete webhook', auth:'tenant' },
    { m:'POST', p:'/swarm/evolve', d:'Trigger 1 swarm evolution cycle', auth:'tenant', body:'{ topic? }' },
    { m:'GET',  p:'/swarm/state', d:'Get swarm epoch + history', auth:'tenant' },
    { m:'GET',  p:'/swarm/stream', d:'SSE stream of swarm cycle (live events)', auth:'tenant' },
    { m:'GET',  p:'/api/health', d:'Service health check', auth:'public' }
  ];

  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Argon API Docs</title>
<script src="https://cdn.tailwindcss.com"><\/script>
<script>tailwind.config={darkMode:'class'}<\/script>
</head>
<body class="bg-slate-950 text-slate-200 font-sans min-h-screen">
<div class="max-w-5xl mx-auto px-6 py-10">
  <header class="mb-10">
    <div class="flex items-center gap-3 mb-4">
      <div class="w-3 h-3 rounded-full bg-indigo-500"></div>
      <h1 class="text-2xl font-bold text-white">Argon API <span class="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400">v2.0</span></h1>
    </div>
    <p class="text-slate-400">Enterprise LLM chat, agentic tool-calling, and autonomous swarm — running on Cloudflare Workers AI.</p>
    <div class="mt-4 flex gap-3">
      <a href="/dashboard" class="text-xs px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold">Open Dashboard</a>
      <a href="#quickstart" class="text-xs px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700">Quickstart</a>
    </div>
  </header>

  <section id="quickstart" class="mb-10 bg-slate-900 border border-slate-800 rounded-xl p-6">
    <h2 class="text-lg font-bold text-white mb-4">Quickstart (60 seconds)</h2>
    <div class="space-y-4 text-sm">
      <div>
        <div class="text-xs uppercase tracking-wider text-slate-400 mb-2">1. Signup and save your key</div>
        <pre class="bg-slate-950 border border-slate-800 rounded p-3 text-xs text-emerald-300 overflow-x-auto"><code>curl -X POST https://argon.vmojuga.workers.dev/signup \\
  -H "Content-Type: application/json" \\
  -d '{"email":"you@example.com","company":"Acme","plan":"starter"}'</code></pre>
      </div>
      <div>
        <div class="text-xs uppercase tracking-wider text-slate-400 mb-2">2. Call chat endpoint</div>
        <pre class="bg-slate-950 border border-slate-800 rounded p-3 text-xs text-emerald-300 overflow-x-auto"><code>curl -X POST https://argon.vmojuga.workers.dev/api/chat \\
  -H "X-API-Key: YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"session_id":"demo","message":"Hello"}'</code></pre>
      </div>
      <div>
        <div class="text-xs uppercase tracking-wider text-slate-400 mb-2">3. JavaScript (fetch)</div>
        <pre class="bg-slate-950 border border-slate-800 rounded p-3 text-xs text-cyan-300 overflow-x-auto"><code>const res = await fetch("https://argon.vmojuga.workers.dev/api/chat", {
  method: "POST",
  headers: { "X-API-Key": "YOUR_KEY", "Content-Type": "application/json" },
  body: JSON.stringify({ message: "Hello" })
});
const data = await res.json();
console.log(data.reply);</code></pre>
      </div>
      <div>
        <div class="text-xs uppercase tracking-wider text-slate-400 mb-2">4. Python (requests)</div>
        <pre class="bg-slate-950 border border-slate-800 rounded p-3 text-xs text-amber-300 overflow-x-auto"><code>import requests
r = requests.post("https://argon.vmojuga.workers.dev/api/chat",
    headers={"X-API-Key": "YOUR_KEY"},
    json={"message": "Hello"})
print(r.json()["reply"])</code></pre>
      </div>
    </div>
  </section>

  <section class="mb-10">
    <h2 class="text-lg font-bold text-white mb-4">Authentication</h2>
    <p class="text-sm text-slate-400 mb-3">Semua endpoint (kecuali <code class="text-xs bg-slate-800 px-1.5 py-0.5 rounded">/signup</code> dan <code class="text-xs bg-slate-800 px-1.5 py-0.5 rounded">/api/health</code>) perlu header:</p>
    <pre class="bg-slate-900 border border-slate-800 rounded p-3 text-xs text-indigo-300"><code>X-API-Key: arg_your_tenant_key_here</code></pre>
    <p class="text-sm text-slate-400 mt-3">Atau guna Bearer token:</p>
    <pre class="bg-slate-900 border border-slate-800 rounded p-3 text-xs text-indigo-300 mt-2"><code>Authorization: Bearer arg_your_tenant_key_here</code></pre>
  </section>

  <section class="mb-10">
    <h2 class="text-lg font-bold text-white mb-4">Endpoints</h2>
    <div class="space-y-3">
      ${endpoints.map(e => `
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div class="flex items-center gap-3 mb-2 flex-wrap">
          <span class="text-xs font-mono font-bold px-2 py-0.5 rounded ${e.m==='GET'?'bg-emerald-500/20 text-emerald-400':e.m==='POST'?'bg-indigo-500/20 text-indigo-400':'bg-rose-500/20 text-rose-400'}">${e.m}</span>
          <code class="text-sm text-white font-mono">${e.p}</code>
          <span class="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">${e.auth}</span>
        </div>
        <div class="text-sm text-slate-400">${e.d}</div>
        ${e.body ? `<div class="mt-2 text-xs text-slate-500">Body: <code class="text-slate-400">${e.body}</code></div>` : ''}
      </div>
      `).join('')}
    </div>
  </section>

  <section class="mb-10">
    <h2 class="text-lg font-bold text-white mb-4">Plans &amp; Quotas</h2>
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead><tr class="border-b border-slate-800 text-left text-slate-400"><th class="py-2">Plan</th><th class="py-2">Chat/mo</th><th class="py-2">Agent/mo</th><th class="py-2">Swarm/mo</th><th class="py-2">RPM</th></tr></thead>
        <tbody class="text-slate-300">
          <tr class="border-b border-slate-800"><td class="py-2 font-bold">Free</td><td>100</td><td>-</td><td>-</td><td>10</td></tr>
          <tr class="border-b border-slate-800"><td class="py-2 font-bold text-indigo-400">Starter</td><td>10,000</td><td>1,000</td><td>100</td><td>60</td></tr>
          <tr class="border-b border-slate-800"><td class="py-2 font-bold text-violet-400">Pro</td><td>100,000</td><td>20,000</td><td>5,000</td><td>300</td></tr>
          <tr><td class="py-2 font-bold text-amber-400">Enterprise</td><td>Unlimited</td><td>Unlimited</td><td>Unlimited</td><td>1000</td></tr>
        </tbody>
      </table>
    </div>
  </section>

  <section class="mb-10">
    <h2 class="text-lg font-bold text-white mb-4">Webhooks</h2>
    <p class="text-sm text-slate-400 mb-3">Receive event delivery via HTTP POST. Setiap request signed dengan HMAC-SHA256 di header <code class="text-xs bg-slate-800 px-1.5 py-0.5 rounded">X-Argon-Signature</code>.</p>
    <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm">
      <div class="font-bold text-white mb-2">Verify signature (Node.js)</div>
      <pre class="bg-slate-950 border border-slate-800 rounded p-3 text-xs text-emerald-300 overflow-x-auto"><code>const crypto = require('crypto');
const sig = req.headers['x-argon-signature']; // "sha256=..."
const expected = 'sha256=' + crypto
  .createHmac('sha256', process.env.WEBHOOK_SECRET)
  .update(JSON.stringify(req.body))
  .digest('hex');
if (sig !== expected) throw new Error('Invalid signature');</code></pre>
      <div class="mt-4 font-bold text-white mb-2">Event types</div>
      <ul class="text-xs text-slate-400 space-y-1">
        <li><code>chat.completed</code> — chat request selesai</li>
        <li><code>agent.completed</code> — agentic cycle selesai</li>
        <li><code>swarm.cycle</code> — swarm epoch baru committed</li>
        <li><code>quota.warning</code> — 80% quota digunakan</li>
        <li><code>quota.exceeded</code> — quota habis</li>
      </ul>
    </div>
  </section>

  <footer class="border-t border-slate-800 pt-6 text-xs text-slate-500">
    Argon API v2.0 — Built on Cloudflare Workers + Workers AI + Durable Objects
  </footer>
</div>
</body></html>`;
}
