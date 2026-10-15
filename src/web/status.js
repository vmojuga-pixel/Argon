export function renderStatus(env, checks) {
  const allOk = checks.every(c => c.ok);
  const statusColor = allOk ? 'emerald' : 'amber';
  const statusText = allOk ? 'All Systems Operational' : 'Partial Degradation';
  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Status — Argon</title>
<meta http-equiv="refresh" content="30">
<script src="https://cdn.tailwindcss.com"><\/script>
</head>
<body class="bg-slate-950 text-slate-200 min-h-screen font-sans">
<div class="max-w-3xl mx-auto px-6 py-12">
  <header class="flex items-center justify-between mb-10">
    <a href="/" class="flex items-center gap-2">
      <div class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
      <span class="font-mono font-bold text-white">ARGON</span>
    </a>
    <span class="text-xs font-mono text-slate-400">Auto-refresh 30s</span>
  </header>

  <div class="bg-${statusColor}-500/10 border border-${statusColor}-500/40 rounded-2xl p-6 mb-8">
    <div class="flex items-center gap-3">
      <div class="w-3 h-3 rounded-full bg-${statusColor}-500"></div>
      <h1 class="text-2xl font-bold text-white">${statusText}</h1>
    </div>
    <p class="text-sm text-slate-400 mt-2">Updated: ${new Date().toISOString()}</p>
  </div>

  <div class="space-y-3">
    ${checks.map(c => `
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
        <div>
          <div class="text-white font-semibold text-sm">${c.name}</div>
          <div class="text-xs text-slate-500 mt-1">${c.detail || ''}</div>
        </div>
        <span class="text-xs font-mono px-2 py-1 rounded ${c.ok ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'}">
          ${c.ok ? 'OPERATIONAL' : 'DOWN'}
        </span>
      </div>
    `).join('')}
  </div>

  <div class="mt-10 text-center text-xs text-slate-500">
    <a href="/legal/terms" class="hover:text-slate-300">Terms</a> ·
    <a href="/legal/privacy" class="hover:text-slate-300">Privacy</a> ·
    <a href="/docs" class="hover:text-slate-300">Docs</a>
  </div>
</div>
</body></html>`;
}
