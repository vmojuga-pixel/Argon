export function renderLanding(env) {
  const app = (env && env.APP_NAME) || 'Argon';
  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${app} // LLM Agent Chat</title>
<script src="https://cdn.tailwindcss.com"><\/script>
<script>tailwind.config={darkMode:'class'}<\/script>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen font-sans">
<header class="border-b border-slate-800 bg-slate-900/70 backdrop-blur sticky top-0 z-50">
  <div class="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
    <div class="flex items-center gap-3">
      <div class="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></div>
      <span class="font-bold tracking-tight">${app}</span>
      <span class="text-xs px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Workers AI</span>
    </div>
    <div class="text-xs text-slate-400" id="status">idle</div>
  </div>
</header>
<main class="max-w-6xl mx-auto px-6 py-8 grid lg:grid-cols-3 gap-6">
  <section class="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col h-[70vh]">
    <div class="flex items-center justify-between mb-3">
      <h1 class="font-semibold">Chat</h1>
      <div class="flex gap-2">
        <input id="apiKey" placeholder="X-API-Key" class="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs w-56 font-mono" />
        <button id="newSession" class="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700">New</button>
      </div>
    </div>
    <div id="messages" class="flex-1 overflow-y-auto space-y-3 pr-1">
      <div class="text-slate-500 text-sm">Session ready. Ask anything.</div>
    </div>
    <form id="chatForm" class="mt-4 flex gap-2">
      <input id="input" class="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500" placeholder="Type your message..." autocomplete="off" />
      <button class="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold">Send</button>
    </form>
  </section>
  <aside class="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
    <h2 class="font-semibold text-sm uppercase tracking-wider text-slate-400">Sessions</h2>
    <div id="sessionList" class="space-y-2 text-xs text-slate-400">No sessions yet.</div>
    <div class="pt-4 border-t border-slate-800">
      <h3 class="text-xs uppercase tracking-wider text-slate-400 mb-2">Agent Mode</h3>
      <label class="flex items-center gap-2 text-xs">
        <input type="checkbox" id="agentMode" class="accent-indigo-500" />
        <span>Use /api/agent (tool-calling)</span>
      </label>
    </div>
  </aside>
</main>
<script>
(function(){
  const S = { session: crypto.randomUUID(), messages: [] };
  const $ = (id) => document.getElementById(id);
  const setStatus = (t) => { $('status').textContent = t; };
  const addMsg = (role, content) => {
    S.messages.push({ role, content });
    const div = document.createElement('div');
    div.className = role === 'user' ? 'text-right' : '';
    div.innerHTML = '<div class="inline-block max-w-[85%] text-left px-4 py-2 rounded-2xl ' +
      (role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-100') +
      ' whitespace-pre-wrap text-sm">' + content.replace(/</g,'&lt;') + '</div>';
    $('messages').appendChild(div);
    $('messages').scrollTop = $('messages').scrollHeight;
  };
  $('newSession').onclick = () => { S.session = crypto.randomUUID(); S.messages = []; $('messages').innerHTML = '<div class="text-slate-500 text-sm">New session: ' + S.session.slice(0,8) + '</div>'; };
  $('chatForm').onsubmit = async (e) => {
    e.preventDefault();
    const text = $('input').value.trim(); if (!text) return;
    addMsg('user', text); $('input').value = '';
    setStatus('thinking...');
    const useAgent = $('agentMode').checked;
    const url = useAgent ? '/api/agent' : '/api/chat';
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-Key': $('apiKey').value.trim() },
        body: JSON.stringify({ session_id: S.session, message: text, history: S.messages.slice(-10) })
      });
      const data = await r.json();
      if (!r.ok) { addMsg('assistant', '[error] ' + (data.error || r.status)); }
      else { addMsg('assistant', data.reply || JSON.stringify(data)); }
    } catch (err) { addMsg('assistant', '[network] ' + err.message); }
    setStatus('idle');
  };
})();
<\/script>
</body>
</html>`;
}
