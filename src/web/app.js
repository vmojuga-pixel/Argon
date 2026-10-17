const CSS = `
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
*{font-family:'Inter',system-ui,sans-serif}
body{background:#0f1115;color:#e2e8f0;margin:0}
.card{background:#181b21;border:1px solid #2a2e37;border-radius:8px;padding:24px;}
.btn{background:#10b981;color:#022c22;padding:8px 16px;border-radius:6px;font-weight:500;font-size:14px;border:none;cursor:pointer;transition:0.2s;}
.btn:hover{background:#059669;}
.btn-secondary{background:#2a2e37;color:#e2e8f0;}
.btn-secondary:hover{background:#374151;}
.nav-item{display:flex;align-items:center;gap:12px;padding:8px 12px;border-radius:6px;color:#9ca3af;text-decoration:none;font-size:14px;font-weight:500;transition:all 0.2s;}
.nav-item:hover{background:#1f232b;color:#e2e8f0;}
.nav-item.active{background:#1f232b;color:#e2e8f0;}
.nav-item.active svg{color:#10b981;}
.bub-user{background:#10b981;color:#022c22;padding:12px 16px;border-radius:8px;max-width:80%;align-self:flex-end;font-size:14px;}
.bub-ai{background:#181b21;border:1px solid #2a2e37;padding:12px 16px;border-radius:8px;max-width:85%;font-size:14px;line-height:1.5;}
.glass{background:#181b21;border:1px solid #2a2e37;border-radius:8px;}
.btn3d{background:#10b981;color:#022c22;padding:8px 16px;border-radius:6px;font-weight:500;font-size:14px;border:none;cursor:pointer;}
.btn3d:hover{background:#059669;}
textarea{background:#0f1115;border:1px solid #2a2e37;color:#e2e8f0;border-radius:6px;padding:12px;font-size:14px;width:100%;box-sizing:border-box;}
textarea:focus{outline:none;border-color:#10b981;}
::-webkit-scrollbar{width:6px;height:6px}
::-webkit-scrollbar-thumb{background:#2a2e37;border-radius:3px}
.txt-grad{color:#e2e8f0;}
</style>`;

export function renderApp(env, sess, view) {
  view = view || "home";
  const app = (env && env.APP_NAME) || "BorneoAI";
  const user = (sess && (sess.email || sess.user)) || "user";
  const initial = String(user).charAt(0).toUpperCase();
  const username = user.split('@')[0];

  const nav = [
    ["home","Home","/app","M3 12l9-9 9 9M5 10v10h14V10"],
    ["chat","Chat","/app/chat","M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"],
    ["build","Build","/app/build","M13 2L3 14h9l-1 8 10-12h-9l1-8z"],
    ["projects","Projects","/app/projects","M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z"],
    ["keys","API Keys","/app/keys","M21 2l-9.6 9.6M15.5 7.5l3 3L22 7l-3-3"],
    ["usage","Usage","/app/usage","M18 20V10M12 20V4M6 20v-6"],
    ["billing","Billing","/app/billing","M2 6h20v12H2zM2 10h20"],
    ["ops","Ops","/app/ops","M12 2v20M2 12h20"],
    ["baobao","Baobao","/app/baobao","M12 2a10 10 0 100 20 10 10 0 000-20zM8 12h8"]
  ];

  const sidebar = nav.map(function(a){
    var id=a[0], label=a[1], href=a[2], icon=a[3];
    var cls = view===id ? "nav-item active" : "nav-item";
    return `<a href="${href}" class="${cls}"><svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="${icon}"/></svg><span>${label}</span></a>`;
  }).join("");

  var content = view==="chat"?vChat():view==="build"?vBuild():view==="projects"?vProjects():view==="keys"?vKeys():view==="usage"?vUsage():view==="billing"?vBilling():view==="ops"?vOps():view==="baobao"?vBaobao():vHome();

  return `<!DOCTYPE html><html lang="en"><head>
  <meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${app} — Console</title>
  <script src="https://cdn.tailwindcss.com"></script>
  ${CSS}
  </head>
  <body class="antialiased">
  <div class="flex h-screen overflow-hidden">
    <aside id="sb" class="w-64 border-r border-[#2a2e37] bg-[#0f1115] flex flex-col h-full hidden md:flex fixed md:static inset-y-0 z-40">
      <div class="h-16 flex items-center px-6 border-b border-[#2a2e37]">
        <span class="font-bold text-lg text-white tracking-tight">${app}</span>
      </div>
      <nav class="flex-1 p-4 space-y-1 overflow-y-auto">
        ${sidebar}
      </nav>
      <div class="p-4 border-t border-[#2a2e37]">
        <div class="flex items-center gap-3 mb-4 px-2">
          <div class="w-8 h-8 rounded-full bg-[#2a2e37] flex items-center justify-center text-sm font-medium text-white">${initial}</div>
          <div class="flex-1 min-w-0">
            <div class="text-sm font-medium text-white truncate">${username}</div>
            <div class="text-xs text-gray-500 truncate">${user}</div>
          </div>
        </div>
        <button onclick="logout()" class="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#1f232b] hover:bg-[#2a2e37] border border-[#2a2e37] rounded-md text-sm font-medium text-gray-300 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          Log out
        </button>
      </div>
    </aside>
    <div class="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
      <header class="h-16 border-b border-[#2a2e37] bg-[#0f1115] flex items-center px-4 gap-3 shrink-0">
        <button onclick="document.getElementById('sb').classList.toggle('hidden')" class="md:hidden text-gray-400 hover:text-white">☰</button>
        <h1 class="font-semibold text-sm capitalize text-white flex-1">${view}</h1>
        <a href="/docs" class="text-xs text-gray-400 hover:text-white transition">Docs</a>
      </header>
      <main class="flex-1 overflow-y-auto">${content}</main>
    </div>
  </div>
  <script>function logout(){fetch('/api/auth/logout',{method:'POST',credentials:'include'}).then(function(){window.location.href='/';});}</script>
  </body></html>`;
}

function vHome(){return `<div class="p-6 md:p-8 max-w-6xl mx-auto fade-in">
<div class="mb-10"><div class="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/5 text-xs text-emerald-400 mb-4">Console Live</div>
<h2 class="text-4xl md:text-5xl font-bold mb-3 leading-tight">Selamat datang.<br><span class="txt-grad">Tanya Baobao apa saja.</span></h2>
<p class="text-slate-400">Pilih satu untuk mula. Semua auto.</p></div>
<div class="grid md:grid-cols-3 gap-5 mb-8">
<a href="/app/chat" class="glass gcard p-6 block"><div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center mb-4 glow"><svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg></div>
<h3 class="font-semibold text-lg mb-1">Tanya Baobao</h3><p class="text-sm text-slate-400">Chat dengan AI. Tanya apa saja.</p></a>
<a href="/app/build" class="glass gcard p-6 block"><div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center mb-4" style="box-shadow:0 0 20px rgba(6,182,212,.5)"><svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg></div>
<h3 class="font-semibold text-lg mb-1">Bina App</h3><p class="text-sm text-slate-400">Directive → full-stack app, live.</p></a>
<a href="/app/keys" class="glass gcard p-6 block"><div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-700 flex items-center justify-center mb-4" style="box-shadow:0 0 20px rgba(139,92,246,.5)"><svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="7.5" cy="15.5" r="5.5"/><path d="M21 2l-9.6 9.6"/></svg></div>
<h3 class="font-semibold text-lg mb-1">API Keys</h3><p class="text-sm text-slate-400">Dapat & urus kunci akses.</p></a>
</div>
<div class="grid md:grid-cols-2 gap-5">
<div class="glass p-6"><div class="text-xs uppercase tracking-wider text-slate-500 mb-4">Usage Bulan Ini</div>
<div class="space-y-4">
<div><div class="flex justify-between text-xs mb-1.5"><span class="text-slate-300">Chat</span><span class="text-slate-500">0 / 1,000</span></div><div class="h-2 bg-slate-800/60 rounded-full overflow-hidden"><div class="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 glow" style="width:0%"></div></div></div>
<div><div class="flex justify-between text-xs mb-1.5"><span class="text-slate-300">Agent</span><span class="text-slate-500">0 / 200</span></div><div class="h-2 bg-slate-800/60 rounded-full overflow-hidden"><div class="h-full bg-gradient-to-r from-cyan-500 to-cyan-400" style="width:0%;box-shadow:0 0 12px rgba(6,182,212,.6)"></div></div></div>
<div><div class="flex justify-between text-xs mb-1.5"><span class="text-slate-300">Swarm</span><span class="text-slate-500">0 / 20</span></div><div class="h-2 bg-slate-800/60 rounded-full overflow-hidden"><div class="h-full bg-gradient-to-r from-purple-500 to-purple-400" style="width:0%;box-shadow:0 0 12px rgba(139,92,246,.6)"></div></div></div>
</div></div>
<div class="glass p-6"><div class="text-xs uppercase tracking-wider text-slate-500 mb-4">Projects</div>
<div class="text-sm text-slate-500">Belum ada. <a href="/app/build" class="text-emerald-400 hover:text-emerald-300 font-medium">Bina sekarang &rarr;</a></div></div>
</div></div>`;}

function vChat(){return `<div class="h-[calc(100vh-4rem)] flex flex-col">
<div id="msgs" class="flex-1 overflow-y-auto p-4 md:p-6">
<div class="max-w-3xl mx-auto"><div class="text-center py-16 fade-in"><div class="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center mx-auto mb-6 glow"><svg class="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg></div>
<h3 class="font-semibold text-2xl mb-3 txt-grad">Tanya Baobao</h3>
<p class="text-sm text-slate-400 max-w-md mx-auto">Taip apa saja. Contoh: Bina sistem tempahan untuk salon.</p></div></div>
</div>
<div class="border-t border-slate-800/50 p-3 md:p-5 bg-slate-950/60 backdrop-blur-xl">
<form id="cf" class="max-w-3xl mx-auto flex gap-2">
<input id="ci" type="text" placeholder="Tanya Baobao apa saja..." autocomplete="off" class="flex-1 bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition"/>
<button class="btn3d px-6 py-3 rounded-xl text-slate-950 font-semibold text-sm">Hantar</button>
</form></div></div>
<script>
var cf=document.getElementById("cf"),m=document.getElementById("msgs"),ci=document.getElementById("ci");
function add(r,t){var w=document.createElement("div");w.className="max-w-3xl mx-auto fade-in";var s=String(t).replace(/</g,"&lt;").replace(/\n/g,"<br>");
if(r==="user"){w.innerHTML='<div class="flex justify-end"><div class="bub-user max-w-[85%] px-4 py-2.5 rounded-2xl text-sm text-slate-950 font-medium">'+s+'</div></div>';}
else{w.innerHTML='<div class="flex gap-3"><div class="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex-shrink-0 flex items-center justify-center text-slate-950 text-xs font-bold glow">B</div><div class="bub-ai max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed">'+s+'</div></div>';}
ms.appendChild(w);ms.scrollTop=ms.scrollHeight;}
function th(){var t=document.createElement("div");t.id="thg";t.className="max-w-3xl mx-auto fade-in";t.innerHTML='<div class="flex gap-3"><div class="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex-shrink-0 flex items-center justify-center text-slate-950 text-xs font-bold glow">B</div><div class="bub-ai px-4 py-3 rounded-2xl"><span class="spinner"></span> <span class="text-slate-400 text-sm">Baobao sedang fikir...</span></div></div>';ms.appendChild(t);ms.scrollTop=ms.scrollHeight;}
cf.addEventListener("submit",async function(e){
e.preventDefault();var v=ci.value.trim();if(!v)return;ci.value="";
add("user",v);th();
try{var r=await fetch("/api/chat",{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:v})});
var d=await r.json();var t2=document.getElementById("thg");if(t2)t2.remove();
add("ai",d.reply||d.response||d.error||JSON.stringify(d));}
catch(e){var t3=document.getElementById("thg");if(t3)t3.remove();add("ai","Error: "+e.message);}});
</script>`;}

function vBuild(){return `<div class="p-6 md:p-8 max-w-3xl mx-auto fade-in"><h2 class="text-3xl font-bold mb-2 txt-grad">Bina App</h2><p class="text-sm text-slate-400 mb-6">Terangkan apa yang anda nak. Baobao bina full-stack Worker.</p><div class="glass p-6"><textarea id="bdir" placeholder="Contoh: Bina sistem tempahan kedai gunting dengan admin panel..." rows="6" class="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-sm focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition resize-none"></textarea><div id="blog" class="mt-4 hidden text-xs text-slate-400 space-y-1 font-mono"></div><button id="bbuild" onclick="bBuild()" class="btn3d mt-4 px-6 py-3 rounded-xl text-slate-950 font-semibold text-sm">Bina Sekarang</button></div></div>
<script>
async function bBuild(){
var d=document.getElementById("bdir").value.trim();
if(!d){alert("Taip directive dulu");return;}
var btn=document.getElementById("bbuild");btn.disabled=true;btn.textContent="Baobao sedang bina...";
var log=document.getElementById("blog");log.classList.remove("hidden");log.innerHTML="";
function addlog(m){var p=document.createElement("div");p.textContent="> "+m;log.appendChild(p);}
addlog("Hantar ke Swarm...");
try{
var r=await fetch("/api/build",{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({directive:d,slug:"app-"+Date.now().toString(36)})});
var res=await r.json();
addlog("Status: "+(res.ok?"OK":"FAIL"));
if(res.url)addlog("Live: "+res.url);
if(res.error)addlog("Error: "+res.error);
if(res.steps&&Array.isArray(res.steps)){res.steps.forEach(function(s){addlog(typeof s==="string"?s:JSON.stringify(s));});}
btn.textContent=res.ok?"Bina Lagi":"Cuba Lagi";btn.disabled=false;
}catch(e){addlog("Error: "+e.message);btn.disabled=false;btn.textContent="Bina Sekarang";}
}
</script>`;}
function vProjects(){return `<div class="p-6 md:p-8 max-w-5xl mx-auto fade-in"><h2 class="text-3xl font-bold mb-6 txt-grad">Projects</h2><div class="glass p-12 text-center"><div class="text-5xl mb-4 opacity-40">&#128230;</div><div class="text-slate-500 text-sm">Belum ada project. <a href="/app/build" class="text-emerald-400">Bina sekarang</a></div></div></div>`;}
function vKeys(){return `<div class="p-6 md:p-8 max-w-3xl mx-auto fade-in"><h2 class="text-3xl font-bold mb-6 txt-grad">API Keys</h2><div class="glass p-6"><div class="text-xs uppercase tracking-wider text-slate-500 mb-3">Your API Key</div><div class="flex"><code id="k" class="flex-1 bg-slate-950/80 border border-slate-800 rounded-lg px-4 py-3 text-xs font-mono truncate text-emerald-300">Loading...</code><button onclick="navigator.clipboard.writeText(document.getElementById('k').textContent);this.textContent='Copied!'" class="ml-2 px-4 py-2 rounded-lg glass hover:bg-slate-800/60 text-xs">Copy</button></div></div></div><script>fetch("/api/me",{credentials:"include"}).then(function(r){return r.json();}).then(function(d){document.getElementById("k").textContent=d.apiKey||d.key||"Not available";}).catch(function(){});</script>`;}
function vUsage(){return `<div class="p-6 md:p-8 max-w-3xl mx-auto fade-in"><h2 class="text-3xl font-bold mb-6 txt-grad">Usage</h2><div class="glass p-12 text-center text-slate-500 text-sm">Statistik akan muncul bila anda mula guna.</div></div>`;
function vOps(){return `<div class="p-6 md:p-8 max-w-3xl mx-auto fade-in">
<h2 class="text-3xl font-bold mb-2 txt-grad">Ops</h2>
<p class="text-sm text-slate-400 mb-6">Taip arahan. Baobao cadang. Kau approve. Auto-deploy.</p>
<div class="glass p-6"><textarea id="opdir" rows="4" placeholder="Contoh: Tukar hero landing jadi biru..." class="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-sm focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition resize-none"></textarea>
<div class="mt-3 flex gap-2"><button id="opbtn" onclick="runOps()" class="btn3d px-5 py-2.5 rounded-xl text-slate-950 font-semibold text-sm">Cadang Plan</button><button onclick="clearOps()" class="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm">Reset</button></div></div>
<div id="opout" class="mt-4"></div>
<script>
async function runOps(){
  var d=document.getElementById("opdir").value.trim(); if(!d){alert("Taip arahan dulu");return;}
  var b=document.getElementById("opbtn"); b.disabled=true; b.textContent="Baobao fikir...";
  var o=document.getElementById("opout"); o.innerHTML='<div class="glass p-4 text-slate-500 text-xs">Baobao baca repo + fikir plan...</div>';
  try{
    var r=await fetch("/api/ops/plan",{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({directive:d})});
    var res=await r.json();
    if(!res.ok){o.innerHTML='<div class="glass p-4 text-rose-400 text-sm">Error: '+(res.error||"unknown")+'</div>';b.disabled=false;b.textContent="Cadang Plan";return;}
    var h='<div class="glass p-5"><div class="text-xs uppercase tracking-wider text-emerald-400 mb-2">Plan</div><div class="text-base font-semibold mb-4">'+res.summary+'</div>';
    res.files.forEach(function(f){h+='<div class="p-3 rounded-xl bg-slate-950/60 border border-slate-800 mb-2 font-mono text-xs"><div class="text-emerald-400 font-semibold mb-1">'+(f.action==="create"?"[NEW] ":"[EDIT] ")+f.path+'</div><div class="text-slate-500 mb-2">'+f.oldSize+' &rarr; '+f.newSize+' bytes</div><div class="whitespace-pre-wrap max-h-60 overflow-auto text-slate-300">'+f.preview+'</div></div>';});
    h+='<div class="mt-4 flex gap-2"><button onclick="applyOps()" class="btn3d px-5 py-2.5 rounded-xl text-slate-950 font-semibold text-sm">Approve & Deploy</button><button onclick="clearOps()" class="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm">Batal</button></div></div>';
    o.innerHTML=h; window._oplan=res; b.disabled=false; b.textContent="Cadang Plan";
  }catch(e){o.innerHTML='<div class="glass p-4 text-rose-400 text-sm">Error: '+e.message+'</div>';b.disabled=false;b.textContent="Cadang Plan";}
}
async function applyOps(){
  if(!window._oplan)return; var o=document.getElementById("opout");
  o.innerHTML+='<div class="glass p-4 text-slate-500 text-xs mt-2">Commit ke GitHub...</div>';
  try{
    var r=await fetch("/api/ops/apply",{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({plan:window._oplan,summary:window._oplan.summary})});
    var res=await r.json();
    var h='<div class="glass p-5"><div class="text-xs uppercase tracking-wider text-emerald-400 mb-2">Hasil</div><div class="font-semibold mb-4">'+(res.message||"")+'</div>';
    if(res.results)res.results.forEach(function(x){h+='<div class="text-xs font-mono py-1">'+(x.ok?"OK":"FAIL")+' '+x.path+(x.sha?' @'+x.sha:'')+'</div>';});
    h+='<div class="mt-4 text-xs text-slate-500">GitHub Actions auto-deploy ~1 minit.</div></div>';
    o.innerHTML=h;
  }catch(e){o.innerHTML+='<div class="glass p-4 text-rose-400 text-sm mt-2">Error: '+e.message+'</div>';}
}
function clearOps(){document.getElementById("opout").innerHTML="";document.getElementById("opdir").value="";window._oplan=null;}
</script></div>`;}

function vBaobao(){return `<div class="h-[calc(100vh-4rem)] flex flex-col">
<div id="bbm" class="flex-1 overflow-y-auto p-4 md:p-6"><div class="max-w-3xl mx-auto">
<div class="text-center py-12 fade-in"><div class="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center mx-auto mb-6 glow"><svg class="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg></div>
<h3 class="font-semibold text-2xl mb-3 txt-grad">Tanya Baobao</h3><p class="text-sm text-slate-400 max-w-md mx-auto">Taip apa saja. Contoh: Bina sistem tempahan untuk salon.</p></div>
</div></div>
<div class="border-t border-slate-800/50 p-3 md:p-5 bg-slate-950/60 backdrop-blur-xl">
<form id="bbf" class="max-w-3xl mx-auto flex gap-2">
<input id="bbi" type="text" placeholder="Tanya Baobao apa saja..." autocomplete="off" class="flex-1 bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition"/>
<button class="btn3d px-6 py-3 rounded-xl text-slate-950 font-semibold text-sm">Hantar</button>
</form></div></div>
<script>
document.getElementById("bbf").addEventListener("submit", async function(e){
  e.preventDefault();
  var i = document.getElementById("bbi");
  var t = i.value.trim();
  if(!t) return;
  i.value = "";
  var m = document.getElementById("bbm");
  
  // Append user msg
  var u = document.createElement("div");
  u.className = "max-w-3xl mx-auto fade-in flex justify-end";
  u.innerHTML = '<div class="bub-user max-w-[85%] px-4 py-2.5 rounded-2xl text-sm text-slate-950 font-medium">' + t + '</div>';
  m.appendChild(u); m.scrollTop = m.scrollHeight;
  
  // Append loading
  var th = document.createElement("div");
  th.id = "th";
  th.className = "max-w-3xl mx-auto fade-in";
  th.innerHTML = '<div class="flex gap-3"><div class="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex-shrink-0 flex items-center justify-center text-slate-950 text-xs font-bold glow">B</div><div class="bub-ai px-4 py-3 rounded-2xl text-slate-400 text-sm">Baobao sedang fikir...</div></div>';
  m.appendChild(th); m.scrollTop = m.scrollHeight;
  
  try {
    var r = await fetch("/api/baobao", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({message: t}) });
    var d = await r.json();
    var el = document.getElementById("th"); if(el) el.remove();
    
    var a = document.createElement("div");
    a.className = "max-w-3xl mx-auto fade-in";
    var reply = d.ok ? d.reply : (d.error === "limit_reached" ? "Limit 5 chat/hari dah habis. Sign up free di /signup" : "Maaf, ada masalah: " + (d.error||"unknown"));
    a.innerHTML = '<div class="flex gap-3"><div class="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex-shrink-0 flex items-center justify-center text-slate-950 text-xs font-bold glow">B</div><div class="bub-ai max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed">' + reply + '</div></div>';
    m.appendChild(a); m.scrollTop = m.scrollHeight;
  } catch(err) {
    var el2 = document.getElementById("th"); if(el2) el2.remove();
    var errDiv = document.createElement("div");
    errDiv.className = "max-w-3xl mx-auto fade-in";
    errDiv.innerHTML = '<div class="text-rose-400 text-sm">Error: ' + err.message + '</div>';
    m.appendChild(errDiv); m.scrollTop = m.scrollHeight;
  }
});
</script>`;}
}
function vBilling(){return `<div class="p-6 md:p-8 max-w-3xl mx-auto fade-in"><h2 class="text-3xl font-bold mb-6 txt-grad">Billing</h2><div class="glass p-8"><div class="text-xs uppercase tracking-wider text-slate-500 mb-2">Current Plan</div><div class="text-4xl font-bold mb-6 txt-grad">Free</div><a href="/#pricing" class="btn3d inline-block px-5 py-2.5 rounded-xl text-slate-950 font-semibold text-sm">Upgrade plan &rarr;</a></div></div>`;
}
