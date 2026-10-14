export function renderDashboard() {
  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Argon Dashboard // Developer Portal</title>
<script src="https://cdn.tailwindcss.com"><\/script>
<script>tailwind.config={darkMode:'class'}<\/script>
</head>
<body class="bg-slate-950 text-slate-200 font-sans min-h-screen">
<header class="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
  <div class="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
    <div class="flex items-center gap-3">
      <div class="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></div>
      <span class="font-bold text-white">ARGON <span class="text-indigo-400">DASHBOARD</span></span>
    </div>
    <div class="flex gap-3 items-center">
      <input id="apiKey" type="password" placeholder="Paste your API key" class="bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs w-64 font-mono" />
      <button onclick="loadAll()" class="text-xs px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold">Load</button>
      <button onclick="logout()" class="text-xs px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700">Clear</button>
    </div>
  </div>
</header>

<main class="max-w-7xl mx-auto px-6 py-6 space-y-6">
  <div id="status" class="text-sm text-slate-400">Masukkan API key anda untuk mula.</div>

  <!-- OVERVIEW -->
  <section id="overview" class="hidden grid grid-cols-1 md:grid-cols-4 gap-4">
    <div class="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <div class="text-xs uppercase tracking-wider text-slate-400 mb-1">Plan</div>
      <div id="plan" class="text-2xl font-bold text-indigo-400">-</div>
    </div>
    <div class="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <div class="text-xs uppercase tracking-wider text-slate-400 mb-1">Chat Used</div>
      <div id="chatUsed" class="text-2xl font-bold text-emerald-400">0</div>
      <div id="chatQuota" class="text-xs text-slate-500">/ -</div>
    </div>
    <div class="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <div class="text-xs uppercase tracking-wider text-slate-400 mb-1">Agent Used</div>
      <div id="agentUsed" class="text-2xl font-bold text-cyan-400">0</div>
      <div id="agentQuota" class="text-xs text-slate-500">/ -</div>
    </div>
    <div class="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <div class="text-xs uppercase tracking-wider text-slate-400 mb-1">Swarm Used</div>
      <div id="swarmUsed" class="text-2xl font-bold text-violet-400">0</div>
      <div id="swarmQuota" class="text-xs text-slate-500">/ -</div>
    </div>
  </section>

  <!-- WEBHOOKS -->
  <section id="webhooks-section" class="hidden bg-slate-900 border border-slate-800 rounded-xl p-5">
    <h2 class="text-sm font-bold text-white mb-3">Webhooks</h2>
    <div class="flex flex-wrap gap-2 mb-4">
      <input id="whUrl" placeholder="https://your-app.com/webhook" class="flex-1 min-w-64 bg-slate-950 border border-slate-700 rounded px-3 py-2 text-xs font-mono" />
      <select id="whEvents" multiple class="bg-slate-950 border border-slate-700 rounded px-2 py-2 text-xs font-mono min-w-56" size="1">
        <option value="chat.completed" selected>chat.completed</option>
        <option value="agent.completed">agent.completed</option>
        <option value="swarm.cycle">swarm.cycle</option>
        <option value="quota.warning">quota.warning</option>
        <option value="quota.exceeded">quota.exceeded</option>
      </select>
      <button onclick="addWebhook()" class="text-xs px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold">Add</button>
    </div>
    <div id="whList" class="space-y-2 text-xs font-mono"></div>
  </section>

  <!-- KEYS -->
  <section id="keys-section" class="hidden bg-slate-900 border border-slate-800 rounded-xl p-5">
    <h2 class="text-sm font-bold text-white mb-3">API Keys</h2>
    <div class="flex gap-2 mb-4">
      <button onclick="rotateKey()" class="text-xs px-4 py-2 rounded bg-amber-600 hover:bg-amber-500 text-white font-bold">Rotate New Key</button>
    </div>
    <div id="rotateOutput" class="text-xs font-mono text-emerald-400 mb-3"></div>
  </section>

  <!-- USAGE LOG -->
  <section id="usage-log" class="hidden bg-slate-900 border border-slate-800 rounded-xl p-5">
    <h2 class="text-sm font-bold text-white mb-3">Recent Activity</h2>
    <div id="activity" class="text-xs font-mono text-slate-400">Loading...</div>
  </section>
</main>

<script>
const $ = (id) => document.getElementById(id);
const API = location.origin;
function headers() { return { 'X-API-Key': $('apiKey').value.trim(), 'Content-Type': 'application/json' }; }

function show(id, on=true) { $(id).classList.toggle('hidden', !on); }

async function loadAll() {
  const key = $('apiKey').value.trim();
  if (!key) { $('status').innerText = 'Sila masukkan API key.'; return; }
  localStorage.setItem('argon_key', key);
  try {
    const r = await fetch(API + '/api/me', { headers: headers() });
    const d = await r.json();
    if (!r.ok) { $('status').innerText = 'Error: ' + (d.error||r.status); return; }
    $('status').innerText = '✅ Logged in as ' + d.tenant.email;
    $('plan').innerText = (d.tenant.plan || 'free').toUpperCase();
    const u = d.usage_current_period || {};
    $('chatUsed').innerText = u.chat_count || 0;
    $('agentUsed').innerText = u.agent_count || 0;
    $('swarmUsed').innerText = u.swarm_count || 0;
    $('chatQuota').innerText = '/ ' + (d.quota.chat === 'unlimited' ? '∞' : d.quota.chat);
    $('agentQuota').innerText = '/ ' + (d.quota.agent === 'unlimited' ? '∞' : d.quota.agent);
    $('swarmQuota').innerText = '/ ' + (d.quota.swarm === 'unlimited' ? '∞' : d.quota.swarm);
    show('overview'); show('webhooks-section'); show('keys-section'); show('usage-log');
    loadWebhooks();
  } catch(e) { $('status').innerText = 'Network error: ' + e.message; }
}

async function loadWebhooks() {
  try {
    const r = await fetch(API + '/api/webhooks', { headers: headers() });
    const d = await r.json();
    const el = $('whList');
    if (!d.webhooks || !d.webhooks.length) { el.innerHTML = '<div class="text-slate-500">Tiada webhook.</div>'; return; }
    el.innerHTML = d.webhooks.map(w => '<div class="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800"><div><div class="text-white">'+w.url+'</div><div class="text-slate-500">'+(w.events||'')+' • active:'+w.active+'</div></div><button onclick="delWebhook(\\''+w.id+'\\')" class="text-rose-400 hover:text-rose-300">DELETE</button></div>').join('');
  } catch(e){}
}

async function addWebhook() {
  const url = $('whUrl').value.trim();
  const evts = Array.from($('whEvents').selectedOptions).map(o => o.value);
  const r = await fetch(API + '/api/webhooks', { method:'POST', headers: headers(), body: JSON.stringify({ url, events: evts }) });
  const d = await r.json();
  if (d.ok) {
    alert('✅ Webhook added!\\n\\nSECRET (save this now):\\n' + d.secret);
    loadWebhooks();
    $('whUrl').value = '';
  } else { alert('Error: ' + (d.error || 'unknown')); }
}

async function delWebhook(id) {
  if (!confirm('Delete this webhook?')) return;
  await fetch(API + '/api/webhooks/' + id, { method:'DELETE', headers: headers() });
  loadWebhooks();
}

async function rotateKey() {
  const r = await fetch(API + '/api/keys/rotate', { method:'POST', headers: headers() });
  const d = await r.json();
  if (d.ok) {
    $('rotateOutput').innerText = 'New key: ' + d.api_key;
    navigator.clipboard.writeText(d.api_key);
    alert('✅ New key generated and copied to clipboard.\\n\\nOld key still valid until revoked.');
  } else { $('rotateOutput').innerText = 'Error: ' + (d.error||'unknown'); }
}

function logout() { localStorage.removeItem('argon_key'); $('apiKey').value=''; location.reload(); }

// Auto-load from localStorage
document.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('argon_key');
  if (saved) { $('apiKey').value = saved; loadAll(); }
});
<\/script>
</body>
</html>`;
}
