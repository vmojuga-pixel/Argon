export function renderSwarmUI() {
  return `<!DOCTYPE html>
<html lang="ms" class="dark">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>NEXUS SWARM // Autonomous Code Factory</title>
<script src="https://cdn.tailwindcss.com"><\/script>
<script>tailwind.config={darkMode:'class'}<\/script>
</head>
<body class="bg-slate-950 text-slate-200 font-mono min-h-screen p-6">
<div class="max-w-6xl mx-auto">
<header class="border-b border-slate-800 pb-4 mb-6 flex items-center justify-between flex-wrap gap-3">
  <div class="flex items-center gap-3">
    <div class="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
    <h1 class="text-lg font-bold text-white">NEXUS<span class="text-cyan-400">SWARM</span> // 7-Agent Council</h1>
    <span id="epoch" class="text-xs px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">EPOCH #0</span>
  </div>
  <div class="flex gap-2 flex-wrap">
    <input id="swarmId" value="GLOBAL_CORP_SWARM" class="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs w-44" />
    <input id="topic" placeholder="custom topic (optional)" class="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs w-52" />
    <button id="runBtn" onclick="runCycle()" class="text-xs px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold">RUN CYCLE</button>
    <button id="stopBtn" onclick="stopStream()" class="text-xs px-3 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold hidden">STOP</button>
  </div>
</header>
<div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
  <div class="bg-slate-900 border border-slate-800 rounded-xl p-4">
    <h2 class="text-xs uppercase tracking-wider text-slate-400 mb-3">Agent Status</h2>
    <div id="agents" class="space-y-2 text-xs">
      ${['01_VISIONARY','02_ARCHITECT','03_SYNTHESIZER','04_THE_BREAKER','05_OPTIMIZER','06_THE_JUDGE','07_THE_SCRIBE']
        .map((a,i)=>`<div id="ag-${i+1}" class="p-2 rounded bg-slate-950 border border-slate-800 flex justify-between"><span>${a}</span><span class="st text-slate-500">IDLE</span></div>`).join('')}
    </div>
  </div>
  <div class="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col h-[70vh]">
    <div class="flex items-center justify-between mb-2">
      <h2 class="text-xs uppercase tracking-wider text-slate-400">Live SSE Feed</h2>
      <span id="ghBadge" class="text-xs text-slate-500">GitHub: --</span>
    </div>
    <div id="feed" class="flex-1 bg-slate-950 border border-slate-800 rounded p-3 text-xs overflow-y-auto space-y-2"></div>
  </div>
</div>
</div>
<script>
let es = null;
const $ = (id) => document.getElementById(id);
function setAgent(i, s) {
  const el = $('ag-'+i); if (!el) return;
  const st = el.querySelector('.st');
  if (s === 'A') { el.className = 'p-2 rounded bg-slate-950 border border-cyan-500 flex justify-between'; st.className='st text-cyan-400 font-bold animate-pulse'; st.innerText='RUNNING'; }
  else if (s === 'D') { el.className = 'p-2 rounded bg-slate-950 border border-emerald-500/50 flex justify-between'; st.className='st text-emerald-400 font-bold'; st.innerText='DONE'; }
  else { el.className = 'p-2 rounded bg-slate-950 border border-slate-800 flex justify-between'; st.className='st text-slate-500'; st.innerText='IDLE'; }
}
function log(a, m, c='text-cyan-400') {
  const t = new Date().toLocaleTimeString('ms-MY',{hour12:false});
  const safe = String(m).replace(/</g,'&lt;').slice(0, 500);
  $('feed').innerHTML += '<div><span class="text-slate-500">['+t+']</span> <span class="'+c+' font-bold">['+a+']</span> <span class="text-slate-300">'+safe+'</span></div>';
  $('feed').scrollTop = $('feed').scrollHeight;
}
function agentIndex(name) {
  const map = { '01_VISIONARY':1,'02_ARCHITECT':2,'03_SYNTHESIZER':3,'04_THE_BREAKER':4,'05_OPTIMIZER':5,'06_THE_JUDGE':6,'07_THE_SCRIBE':7 };
  return map[name] || 0;
}
function runCycle() {
  if (es) { es.close(); es = null; }
  for (let i=1;i<=7;i++) setAgent(i,'I');
  $('feed').innerHTML = '';
  $('runBtn').classList.add('hidden');
  $('stopBtn').classList.remove('hidden');
  const sid = $('swarmId').value.trim() || 'GLOBAL_CORP_SWARM';
  const topic = $('topic').value.trim();
  const url = '/swarm/stream?swarm='+encodeURIComponent(sid)+(topic?'&topic='+encodeURIComponent(topic):'');
  es = new EventSource(url);
  es.onmessage = (e) => {
    const d = JSON.parse(e.data);
    if (d.type === 'epoch_start') { $('epoch').innerText = 'EPOCH #'+d.epoch; log('SYSTEM','Epoch '+d.epoch+' started','text-emerald-400'); }
    else if (d.type === 'agent_start') { setAgent(agentIndex(d.agent),'A'); log(d.agent,'working...','text-amber-400'); }
    else if (d.type === 'agent_done') {
      setAgent(agentIndex(d.agent),'D');
      let extra = d.sandbox ? ' | sandbox: '+d.sandbox.join('; ') : '';
      log(d.agent, (d.output||'')+extra, 'text-cyan-400');
    }
    else if (d.type === 'complete') { log('SYSTEM','Cycle complete. GitHub: '+(d.githubStatus.synced?'OK':'FAIL'),'text-emerald-400'); $('ghBadge').innerText='GitHub: '+(d.githubStatus.synced?'OK':'FAIL'); finish(); }
    else if (d.type === 'error') { log('ERROR', d.message, 'text-rose-400'); finish(); }
  };
  es.onerror = () => { log('SYSTEM','SSE closed','text-rose-400'); finish(); };
}
function finish() { if (es) { es.close(); es = null; } $('runBtn').classList.remove('hidden'); $('stopBtn').classList.add('hidden'); }
function stopStream() { finish(); log('SYSTEM','Stopped by user','text-rose-400'); }
async function initState() {
  try {
    const sid = $('swarmId').value.trim() || 'GLOBAL_CORP_SWARM';
    const r = await fetch('/swarm/state?swarm='+encodeURIComponent(sid));
    const d = await r.json();
    $('epoch').innerText = 'EPOCH #'+d.epoch;
  } catch(e){}
}
document.addEventListener('DOMContentLoaded', initState);
<\/script>
</body></html>`;
}
