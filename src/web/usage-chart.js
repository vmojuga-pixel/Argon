export function renderUsageChartScript() {
  return `
    async function loadUsageChart(apiKey) {
      const el = document.getElementById('usage-chart');
      if (!el) return;
      try {
        const r = await fetch('/api/me', { headers: { 'X-API-Key': apiKey } });
        const d = await r.json();
        if (!r.ok) { el.innerText = 'Error loading usage'; return; }
        const u = d.usage_current_period || {};
        const max = Math.max(u.chat_count || 0, u.agent_count || 0, u.swarm_count || 0, 1);
        const bars = [
          { label: 'Chat', value: u.chat_count || 0, color: 'emerald' },
          { label: 'Agent', value: u.agent_count || 0, color: 'cyan' },
          { label: 'Swarm', value: u.swarm_count || 0, color: 'violet' },
        ];
        el.innerHTML = '<div class="space-y-3">' + bars.map(b => {
          const pct = Math.round((b.value / max) * 100);
          return '<div><div class="flex justify-between text-xs font-mono mb-1"><span class="text-slate-400">' + b.label + '</span><span class="text-' + b.color + '-400 font-bold">' + b.value + '</span></div><div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden"><div class="bg-' + b.color + '-500 h-full" style="width:' + pct + '%"></div></div></div>';
        }).join('') + '</div>';
      } catch (e) { el.innerText = 'Network error'; }
    }
  `;
}
