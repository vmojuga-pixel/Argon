export function renderOverlordUI() {
  return `<!DOCTYPE html>
<html lang="ms" class="dark">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ARGON OVERLORD // Tier-1 Senior Dev</title>
<script src="https://cdn.tailwindcss.com"><\/script>
<script>tailwind.config={darkMode:'class',theme:{extend:{colors:{ov:{950:'#05070b',900:'#0c1018',800:'#161e2e',700:'#25324d',emerald:'#10b981',cyan:'#06b6d4',amber:'#f59e0b'}},fontFamily:{mono:['JetBrains Mono','monospace']}}}}<\/script>
</head>
<body class="bg-ov-950 text-slate-200 font-sans min-h-screen flex flex-col">
<header class="border-b border-ov-800 bg-ov-900/90 sticky top-0 z-50 backdrop-blur">
<div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between flex-wrap gap-2">
<div class="flex items-center space-x-3">
<div class="w-3 h-3 rounded-full bg-ov-emerald animate-ping"></div>
<span class="font-mono font-bold text-base text-white">ARGON<span class="text-ov-emerald">OVERLORD</span> // SENIOR_DEV_TIER_1</span>
<span class="text-[10px] font-mono bg-ov-800 text-ov-cyan px-2 py-0.5 rounded border border-ov-700">24/7 AUTO</span>
</div>
<div class="flex items-center gap-2">
<input id="apiKey" placeholder="X-API-Key" class="bg-ov-950 border border-ov-700 rounded-lg px-2 py-1.5 text-xs font-mono w-40" />
<button onclick="askReport()" class="text-xs font-mono bg-ov-cyan hover:bg-cyan-400 text-ov-950 font-bold px-3 py-2 rounded-lg">TANYA REPORT</button>
<button onclick="runMaintenance()" class="text-xs font-mono bg-ov-800 hover:bg-ov-700 px-3 py-2 rounded-lg border border-ov-700">WATCHDOG SWEEP</button>
</div>
</div>
</header>
<main class="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
<div class="lg:col-span-5 flex flex-col space-y-5">
<div class="bg-ov-900 border border-ov-800 rounded-xl p-5">
<h2 class="text-xs font-mono uppercase tracking-wider text-ov-emerald font-bold mb-3">1. Arahan Tugas SIR</h2>
<div class="space-y-3">
<label class="block text-xs text-slate-400 mb-1 font-mono">Slug (default auto):</label>
<input id="slug" placeholder="argon-app-billing-portal" class="w-full bg-ov-950 border border-ov-700 rounded-lg p-2.5 text-xs font-mono text-white mb-2" />
<label class="block text-xs text-slate-400 mb-1 font-mono">Arahan spesifik:</label>
<textarea id="directive" rows="5" placeholder="Contoh: Bina halaman web status pelanggan Argon dengan API semakan kunci lesen, auto-deploy, monitor /health." class="w-full bg-ov-950 border border-ov-700 rounded-lg p-3 text-xs font-mono text-white"></textarea>
<button id="deployBtn" onclick="dispatch()" class="w-full bg-ov-emerald hover:bg-emerald-400 text-ov-950 font-mono font-bold py-3 px-4 rounded-lg text-xs tracking-wider mt-2">ARAHKAN SENIOR DEV (BUILD + DEPLOY + MAINTAIN)</button>
</div>
</div>
<div class="bg-ov-900 border border-ov-800 rounded-xl p-5 flex-1">
<h2 class="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3">2. Fokus Topik 24/7</h2>
<div class="space-y-2 text-xs font-mono text-slate-300" id="topicsBox">
<div class="p-2 bg-ov-950 border border-ov-800 rounded">1. Cloudflare Workers Durable Objects</div>
<div class="p-2 bg-ov-950 border border-ov-800 rounded">2. SaaS Multi-Tenant Security</div>
<div class="p-2 bg-ov-950 border border-ov-800 rounded">3. Stripe Webhook Idempotency</div>
<div class="p-2 bg-ov-950 border border-ov-800 rounded">4. OpenAPI Recon SDK Pipeline</div>
</div>
<div class="text-[11px] font-mono text-slate-400 bg-ov-950 p-3 rounded border border-ov-800 mt-3">
<span class="text-ov-cyan font-bold">INFO:</span> Setiap 6 jam, watchdog periksa semua servis + tulis Grimoire.
</div>
</div>
</div>
<div class="lg:col-span-7 flex flex-col space-y-5">
<div class="bg-ov-900 border border-ov-800 rounded-xl p-5">
<div class="flex items-center justify-between mb-3">
<h2 class="text-xs font-mono uppercase tracking-wider text-ov-cyan font-bold">3. Laporan Eksekutif</h2>
<span id="reportTime" class="text-[11px] font-mono text-slate-500">Sedia</span>
</div>
<div id="summaryBox" class="bg-ov-950 border border-ov-700 rounded-lg p-4 font-mono text-xs text-slate-200 mb-4 leading-relaxed">// Paste X-API-Key, tekan TANYA REPORT untuk mula.</div>
<div class="grid grid-cols-3 gap-3 font-mono text-center">
<div class="bg-ov-950 border border-ov-800 p-3 rounded-lg"><div class="text-[10px] text-slate-400">SERVIS AKTIF</div><div id="mActive" class="text-lg font-bold text-ov-emerald mt-1">0</div></div>
<div class="bg-ov-950 border border-ov-800 p-3 rounded-lg"><div class="text-[10px] text-slate-400">AUTO-HEAL</div><div id="mHeal" class="text-lg font-bold text-ov-amber mt-1">0</div></div>
<div class="bg-ov-950 border border-ov-800 p-3 rounded-lg"><div class="text-[10px] text-slate-400">EPOCH</div><div id="mEpoch" class="text-lg font-bold text-ov-cyan mt-1">#0</div></div>
</div>
</div>
<div class="bg-ov-900 border border-ov-800 rounded-xl p-5 flex-1 flex flex-col">
<div class="flex items-center justify-between mb-3">
<h2 class="text-xs font-mono uppercase tracking-wider text-slate-400">4. Servis Aktif (Watchdog)</h2>
<span class="text-[11px] font-mono text-ov-emerald">AKTIF</span>
</div>
<div id="servicesBox" class="flex-1 bg-ov-950 border border-ov-800 rounded-lg p-4 font-mono text-xs overflow-y-auto space-y-3 max-h-96">
<div class="text-slate-500">// Tiada servis lagi. Bagi arahan di Panel 1.</div>
</div>
</div>
</div>
</main>
<script>
const $ = (id) => document.getElementById(id);
const API = location.origin;
const hdr = () => ({ 'Content-Type': 'application/json', 'X-API-Key': $('apiKey').value.trim() });

async function dispatch() {
  const directive = $('directive').value.trim();
  if (!directive) return alert('Masukkan arahan.');
  const slug = $('slug').value.trim() || null;
  $('deployBtn').disabled = true;
  $('deployBtn').innerText = 'BUILDING + DEPLOYING...';
  try {
    const r = await fetch(API + '/overlord/command', { method: 'POST', headers: hdr(), body: JSON.stringify({ directive, slug }) });
    const d = await r.json();
    if (!r.ok) alert('Error: ' + (d.error || r.status));
    else {
      $('summaryBox').innerText = 'TASK SELESAI: ' + d.slug + ' — mode: ' + (d.deployInfo && d.deployInfo.mode);
      $('directive').value = ''; $('slug').value = '';
      await askReport();
    }
  } catch (e) { alert('Network: ' + e.message); }
  $('deployBtn').disabled = false;
  $('deployBtn').innerText = 'ARAHKAN SENIOR DEV (BUILD + DEPLOY + MAINTAIN)';
}

async function askReport() {
  try {
    const r = await fetch(API + '/overlord/report', { headers: hdr() });
    const d = await r.json();
    if (!r.ok) { $('summaryBox').innerText = 'Error: ' + (d.error || r.status); return; }
    $('reportTime').innerText = 'Kemaskini: ' + new Date(d.reportTimestamp).toLocaleTimeString('ms-MY', { hour12: false });
    $('summaryBox').innerText = d.summaryForSir || 'Report ready.';
    $('mActive').innerText = (d.metrics && d.metrics.activeServicesCount) || 0;
    $('mHeal').innerText = (d.metrics && d.metrics.totalAutoHealsExecuted) || 0;
    $('mEpoch').innerText = '#' + ((d.metrics && d.metrics.totalEpoch) || 0);
    renderServices(d.activeServices || []);
  } catch (e) { $('summaryBox').innerText = 'Network: ' + e.message; }
}

async function runMaintenance() {
  try {
    const r = await fetch(API + '/overlord/maintain', { method: 'POST', headers: hdr() });
    const d = await r.json();
    $('summaryBox').innerText = 'WATCHDOG SWEEP DONE — Epoch #' + (d.epoch || 0) + ' | Services: ' + (d.servicesChecked || 0) + ' | Topic: ' + (d.focusTopic || '-');
    await askReport();
  } catch (e) { $('summaryBox').innerText = 'Network: ' + e.message; }
}

function renderServices(list) {
  const box = $('servicesBox');
  if (!list || !list.length) { box.innerHTML = '<div class="text-slate-500">// Tiada servis lagi.</div>'; return; }
  box.innerHTML = list.map(s => {
    const url = (s.deployInfo && s.deployInfo.url) || '-';
    return '<div class="p-3 bg-ov-900 border border-ov-800 rounded-lg">' +
      '<div class="flex items-center justify-between mb-2"><span class="text-white font-bold text-sm">' + s.slug + '</span>' +
      '<span class="px-2 py-0.5 text-[10px] rounded bg-emerald-500/20 text-ov-emerald border border-emerald-500/40">' + s.healthStatus + '</span></div>' +
      '<div class="text-slate-300 text-xs mb-2">' + (s.directive || '') + '</div>' +
      '<div class="text-[11px] text-slate-400">URL: <span class="text-ov-cyan">' + url + '</span></div>' +
      '<div class="text-[11px] text-slate-400">Repo: <span class="text-amber-300">' + (s.gitPath || '-') + '</span></div>' +
      '</div>';
  }).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('argon_key');
  if (saved) $('apiKey').value = saved;
  $('apiKey').addEventListener('change', () => localStorage.setItem('argon_key', $('apiKey').value.trim()));
});
<\/script>
</body>
</html>`;
}
