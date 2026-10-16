const CSS = `
<style>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');
*{font-family:'Space Grotesk',system-ui,sans-serif}
body{background:#030509;color:#e2e8f0;overflow-x:hidden}
body::before{content:'';position:fixed;inset:0;background-image:linear-gradient(rgba(16,185,129,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(16,185,129,.06) 1px,transparent 1px);background-size:48px 48px;mask-image:radial-gradient(ellipse at 50% 40%,#000 20%,transparent 75%);pointer-events:none;z-index:0}
.orb{position:fixed;border-radius:9999px;filter:blur(80px);pointer-events:none;z-index:0;opacity:.3}
.orb1{top:10%;right:-5%;width:30vw;height:30vw;background:radial-gradient(circle,#06b6d4,transparent 70%);animation:fl 15s ease-in-out infinite}
.orb2{bottom:5%;left:-5%;width:35vw;height:35vw;background:radial-gradient(circle,#8b5cf6,transparent 70%);animation:fl 18s ease-in-out infinite reverse}
@keyframes fl{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(40px,40px) scale(1.15)}}
.glass{background:linear-gradient(135deg,rgba(15,23,42,.75),rgba(15,23,42,.4));backdrop-filter:blur(16px);border:1px solid rgba(148,163,184,.15);border-radius:1rem;position:relative;overflow:hidden}
.glass::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(16,185,129,.5),transparent)}
.gcard{transition:all .3s cubic-bezier(.4,0,.2,1)}
.gcard:hover{transform:translateY(-4px);box-shadow:0 20px 40px -20px rgba(16,185,129,.4),0 0 60px -30px rgba(6,182,212,.3)}
.glow{box-shadow:0 0 20px rgba(16,185,129,.4),0 0 40px rgba(16,185,129,.15)}
.btn3d{background:linear-gradient(180deg,#10b981,#059669);box-shadow:0 4px 0 #047857,0 8px 20px -8px rgba(16,185,129,.6);transition:all .15s}
.btn3d:hover{transform:translateY(2px);box-shadow:0 2px 0 #047857,0 4px 12px -6px rgba(16,185,129,.6)}
.bub-user{background:linear-gradient(135deg,#10b981,#059669);box-shadow:0 8px 24px -12px rgba(16,185,129,.6)}
.bub-ai{background:linear-gradient(135deg,rgba(30,41,59,.9),rgba(15,23,42,.7));backdrop-filter:blur(12px);border:1px solid rgba(148,163,184,.12);box-shadow:0 8px 24px -16px rgba(0,0,0,.8)}
.sidebar{background:linear-gradient(180deg,rgba(3,7,18,.95),rgba(3,7,18,.85));backdrop-filter:blur(20px);border-right:1px solid rgba(148,163,184,.1)}
.nav-item{position:relative;transition:all .2s}
.nav-item.active{background:linear-gradient(135deg,rgba(16,185,129,.15),rgba(6,182,212,.08));color:#34d399}
.nav-item.active::before{content:'';position:absolute;left:0;top:15%;bottom:15%;width:3px;background:linear-gradient(180deg,#10b981,#06b6d4);border-radius:0 4px 4px 0;box-shadow:0 0 12px rgba(16,185,129,.8)}
.spinner{width:14px;height:14px;border:2px solid rgba(148,163,184,.3);border-top-color:#10b981;border-radius:50%;animation:sp .8s linear infinite;display:inline-block}
@keyframes sp{to{transform:rotate(360deg)}}
.fade-in{animation:fi .4s ease-out}
@keyframes fi{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.txt-grad{background:linear-gradient(135deg,#34d399,#22d3ee,#818cf8);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
::-webkit-scrollbar{width:6px}::-webkit-scrollbar-thumb{background:rgba(148,163,184,.2);border-radius:3px}
</style>`;

export function renderApp(env, sess, view) {
  view = view || "home";
  const app = (env && env.APP_NAME) || "BorneoAI";
  const user = (sess && (sess.email || sess.user)) || "user";
  const initial = String(user).charAt(0).toUpperCase();
  const nav = [["home","Home","/app"],["chat","Chat","/app/chat"],["build","Build","/app/build"],["projects","Projects","/app/projects"],["keys","API Keys","/app/keys"],["usage","Usage","/app/usage"],["billing","Billing","/app/billing"]];
  const icons = {
    home: "M3 12l9-9 9 9M5 10v10h14V10",
    chat: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",
    build: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
    projects: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
    keys: "M21 2l-9.6 9.6M15.5 7.5l3 3L22 7l-3-3",
    usage: "M18 20V10M12 20V4M6 20v-6",
    billing: "M2 6h20v12H2zM2 10h20"
  };
  const ic = (n) => '<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="' + (icons[n]||"") + '"/></svg>';
  const sidebar = nav.map(function(a){
    var id=a[0], label=a[1], href=a[2];
    var cls = view===id ? "nav-item active" : "nav-item text-slate-400 hover:text-white hover:bg-slate-800/40";
    return '<a href="'+href+'" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm '+cls+'">'+ic(id)+'<span>'+label+'</span></a>';
  }).join("");
  var content = view==="chat"?vChat():view==="build"?vBuild():view==="projects"?vProjects():view==="keys"?vKeys():view==="usage"?vUsage():view==="billing"?vBilling():vHome();
  return `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="theme-color" content="#030509"/>
<title>${app} — Console</title>
<script src="https://cdn.tailwindcss.com"></script>${CSS}</head>
<body><div class="orb orb1"></div><div class="orb orb2"></div>
<div class="flex min-h-screen relative z-10">
<aside id="sb" class="sidebar hidden md:flex md:flex-col w-60 fixed md:sticky md:top-0 h-screen inset-y-0 z-40">
<div class="h-16 flex items-center px-4 border-b border-slate-800/50 gap-2">

<span class="font-bold text-lg">${app}</span></div>
<nav class="flex-1 p-3 space-y-1 overflow-y-auto">${sidebar}</nav>
<div class="p-3 border-t border-slate-800/50"><div class="flex items-center gap-2 px-2 py-2">
<div class="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-slate-950 glow">${initial}</div>
<div class="flex-1 min-w-0"><div class="text-xs truncate text-slate-300">${user}</div></div>
<button onclick="logout()" class="text-slate-500 hover:text-rose-400 text-xs">Keluar</button>
</div></div></aside>
<div class="flex-1 flex flex-col min-w-0">
<header class="h-16 border-b border-slate-800/50 bg-slate-950/60 backdrop-blur-xl sticky top-0 z-30 flex items-center px-4 gap-3">
<button onclick="document.getElementById('sb').classList.toggle('hidden')" class="md:hidden text-slate-400 text-xl">&#9776;</button>
<h1 class="font-semibold text-sm flex-1 capitalize txt-grad">${view}</h1>
<a href="/docs" class="text-xs text-slate-400 hover:text-emerald-400">Docs</a></header>
<main class="flex-1">${content}</main>
</div></div>
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
var cf=document.getElementById("cf"),ms=document.getElementById("msgs"),ci=document.getElementById("ci");
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

function vBuild(){return `<div class="p-6 md:p-8 max-w-3xl mx-auto fade-in"><h2 class="text-3xl font-bold mb-2 txt-grad">Bina App</h2><p class="text-sm text-slate-400 mb-6">Terangkan apa yang anda nak. Baobao bina full-stack Worker.</p><div class="glass p-6"><textarea placeholder="Contoh: Bina sistem tempahan kedai gunting dengan admin panel..." rows="6" class="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-sm focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition resize-none"></textarea><button class="btn3d mt-4 px-6 py-3 rounded-xl text-slate-950 font-semibold text-sm">Bina Sekarang</button></div></div>`;}
function vProjects(){return `<div class="p-6 md:p-8 max-w-5xl mx-auto fade-in"><h2 class="text-3xl font-bold mb-6 txt-grad">Projects</h2><div class="glass p-12 text-center"><div class="text-5xl mb-4 opacity-40">&#128230;</div><div class="text-slate-500 text-sm">Belum ada project. <a href="/app/build" class="text-emerald-400">Bina sekarang</a></div></div></div>`;}
function vKeys(){return `<div class="p-6 md:p-8 max-w-3xl mx-auto fade-in"><h2 class="text-3xl font-bold mb-6 txt-grad">API Keys</h2><div class="glass p-6"><div class="text-xs uppercase tracking-wider text-slate-500 mb-3">Your API Key</div><div class="flex"><code id="k" class="flex-1 bg-slate-950/80 border border-slate-800 rounded-lg px-4 py-3 text-xs font-mono truncate text-emerald-300">Loading...</code><button onclick="navigator.clipboard.writeText(document.getElementById('k').textContent);this.textContent='Copied!'" class="ml-2 px-4 py-2 rounded-lg glass hover:bg-slate-800/60 text-xs">Copy</button></div></div></div><script>fetch("/api/me",{credentials:"include"}).then(function(r){return r.json();}).then(function(d){document.getElementById("k").textContent=d.apiKey||d.key||"Not available";}).catch(function(){});</script>`;}
function vUsage(){return `<div class="p-6 md:p-8 max-w-3xl mx-auto fade-in"><h2 class="text-3xl font-bold mb-6 txt-grad">Usage</h2><div class="glass p-12 text-center text-slate-500 text-sm">Statistik akan muncul bila anda mula guna.</div></div>`;}
function vBilling(){return `<div class="p-6 md:p-8 max-w-3xl mx-auto fade-in"><h2 class="text-3xl font-bold mb-6 txt-grad">Billing</h2><div class="glass p-8"><div class="text-xs uppercase tracking-wider text-slate-500 mb-2">Current Plan</div><div class="text-4xl font-bold mb-6 txt-grad">Free</div><a href="/#pricing" class="btn3d inline-block px-5 py-2.5 rounded-xl text-slate-950 font-semibold text-sm">Upgrade plan &rarr;</a></div></div>`;}
