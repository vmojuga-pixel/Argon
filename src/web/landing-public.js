export function renderPublicLanding(env, sessOk) {
  const app = (env && env.APP_NAME) || "BorneoAI";
  const year = new Date().getFullYear();
  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${app} — Autocode AI untuk Bisnes</title>
<meta name="description" content="Kami bina software, website, full-stack apps untuk bisnes anda. Enterprise, startup, SME, non-tech — tak payah coding." />
<script src="https://cdn.tailwindcss.com"></script>
<script>tailwind.config={darkMode:"class"}</script>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen font-sans antialiased">
<header class="border-b border-slate-800 bg-slate-900/70 backdrop-blur sticky top-0 z-50">
<div class="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
<div class="flex items-center gap-3">

<span class="font-bold tracking-tight">${app}</span>

</div>
<nav class="flex items-center gap-4 text-sm">
<a href="#use-cases" class="text-slate-400 hover:text-white hidden md:inline">Use Cases</a>
<a href="#pricing" class="text-slate-400 hover:text-white hidden md:inline">Pricing</a>
<a href="/docs" class="text-slate-400 hover:text-white">Docs</a>
<a href="/login" class="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs">Sign In</a>
</nav>
</div>
</header>
<main>
<section class="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-xs text-cyan-400 mb-6">

Live — deploy dalam minit
</div>
<h1 class="text-4xl md:text-6xl font-bold tracking-tight leading-tight mb-6">

<span class="bg-gradient-to-r from-cyan-400 to-cyan-400 bg-clip-text text-transparent">Bisnes kau, kod kami.</span><br><span class="text-slate-400 text-2xl md:text-4xl">Tanya Baobao, cun sudah 🪐</span></h1>

<div class="flex flex-wrap items-center justify-center gap-3 mb-8">
<a href="/signup" class="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-sm transition">Mula Sekarang →</a>
<a href="#how" class="px-6 py-3 rounded-xl border border-slate-700 hover:border-slate-600 text-sm transition">Tengok Cara Kerja</a>
</div>
<p class="text-xs text-slate-500">Free tier tersedia · API key dalam 30 saat · Tiada kad kredit</p>
</section>
<section id="use-cases" class="max-w-6xl mx-auto px-6 py-16">
<h2 class="text-3xl font-bold text-center mb-3">Siapa yang guna BorneoAI?</h2>
<p class="text-center text-slate-400 mb-12 max-w-2xl mx-auto">Satu platform, empat jenis pengguna. Tak kisah anda developer atau bukan.</p>
<div class="grid md:grid-cols-2 gap-5">
<div class="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition">
<div class="text-xs uppercase tracking-wider text-cyan-400 mb-2">Enterprise</div>
<h3 class="text-xl font-semibold mb-2">Automasi skala besar</h3>
<p class="text-sm text-slate-400 leading-relaxed">Integrasi API, workflow automation, agentic RAG, multi-tenant SaaS. Deploy ke Edge tanpa infra team.</p>
</div>
<div class="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition">
<div class="text-xs uppercase tracking-wider text-cyan-400 mb-2">Startup</div>
<h3 class="text-xl font-semibold mb-2">MVP dalam hari, bukan bulan</h3>
<p class="text-sm text-slate-400 leading-relaxed">Dari idea ke live product. Full-stack scaffold, database, API, auth — semua auto-generate.</p>
</div>
<div class="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition">
<div class="text-xs uppercase tracking-wider text-amber-400 mb-2">SME</div>
<h3 class="text-xl font-semibold mb-2">Website + sistem bisnes</h3>
<p class="text-sm text-slate-400 leading-relaxed">Company profile, booking system, inventory, CRM ringkas. Kos fraction dari hire developer.</p>
</div>
<div class="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/40 transition">
<div class="text-xs uppercase tracking-wider text-purple-400 mb-2">Non-Tech Founder</div>
<h3 class="text-xl font-semibold mb-2">Faham coding tanpa belajar coding</h3>
<p class="text-sm text-slate-400 leading-relaxed">Taip apa yang anda mahu. BorneoAI handle architecture, database, security, deploy. Anda focus pada bisnes.</p>
</div>
</div>
</section>
<section id="how" class="max-w-5xl mx-auto px-6 py-16">
<h2 class="text-3xl font-bold text-center mb-3">Cara Ia Berfungsi</h2>
<p class="text-center text-slate-400 mb-12">Tiga langkah. Tak payah setup apa-apa.</p>
<div class="grid md:grid-cols-3 gap-5">
<div class="p-6 rounded-2xl bg-slate-900 border border-slate-800">
<div class="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold mb-4">01</div>
<h3 class="font-semibold mb-2">Taip arahan anda</h3>
<p class="text-sm text-slate-400">Contoh: "Bina sistem booking untuk salon, dengan admin panel dan payment."</p>
</div>
<div class="p-6 rounded-2xl bg-slate-900 border border-slate-800">
<div class="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold mb-4">02</div>
<h3 class="font-semibold mb-2">BorneoAI bina</h3>
<p class="text-sm text-slate-400">Swarm 7-ejen reka, kod, kritik, perbaiki, dan deploy secara automatik ke Edge.</p>
</div>
<div class="p-6 rounded-2xl bg-slate-900 border border-slate-800">
<div class="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold mb-4">03</div>
<h3 class="font-semibold mb-2">Live & sedia guna</h3>
<p class="text-sm text-slate-400">Anda dapat URL live + API key. Boleh terus share dengan team atau pelanggan.</p>
</div>
</div>
</section>
<section id="pricing" class="max-w-6xl mx-auto px-6 py-16">
<h2 class="text-3xl font-bold text-center mb-3">Pricing</h2>
<p class="text-center text-slate-400 mb-12">Mula free. Bayar bila ready. Semua tier deploy ke 300+ edge locations.</p>
<div class="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
<div class="p-6 rounded-2xl bg-slate-900 border border-slate-800">
<div class="text-sm text-slate-400 mb-1">Free</div>
<div class="text-3xl font-bold mb-4">RM 0</div>
<ul class="text-sm text-slate-400 space-y-2 mb-6">
<li>100 chat/bulan</li>
<li>1 project</li>
<li>Community support</li>
</ul>
<a href="/signup?plan=free" class="block text-center px-4 py-2.5 rounded-lg border border-slate-700 hover:border-slate-600 text-sm">Mula Free</a>
</div>
<div class="p-6 rounded-2xl bg-slate-900 border border-slate-800">
<div class="text-sm text-slate-400 mb-1">Starter</div>
<div class="text-3xl font-bold mb-4">RM 49<span class="text-sm text-slate-500 font-normal">/bln</span></div>
<ul class="text-sm text-slate-400 space-y-2 mb-6">
<li>1,000 chat/bulan</li>
<li>200 agent calls</li>
<li>20 swarm cycles</li>
<li>5 projects</li>
</ul>
<a href="/signup?plan=starter" class="block text-center px-4 py-2.5 rounded-lg border border-slate-700 hover:border-slate-600 text-sm">Pilih Starter</a>
</div>
<div class="p-6 rounded-2xl bg-slate-900 border-2 border-cyan-500/50 relative">
<div class="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-cyan-500 text-slate-950 text-xs font-semibold">Popular</div>
<div class="text-sm text-cyan-400 mb-1">Pro</div>
<div class="text-3xl font-bold mb-4">RM 199<span class="text-sm text-slate-500 font-normal">/bln</span></div>
<ul class="text-sm text-slate-400 space-y-2 mb-6">
<li>10,000 chat/bulan</li>
<li>2,000 agent calls</li>
<li>200 swarm cycles</li>
<li>Unlimited projects</li>
</ul>
<a href="/signup?plan=pro" class="block text-center px-4 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-sm">Pilih Pro</a>
</div>
<div class="p-6 rounded-2xl bg-slate-900 border border-slate-800">
<div class="text-sm text-slate-400 mb-1">Business</div>
<div class="text-3xl font-bold mb-4">RM 799<span class="text-sm text-slate-500 font-normal">/bln</span></div>
<ul class="text-sm text-slate-400 space-y-2 mb-6">
<li>100,000 chat/bulan</li>
<li>20,000 agent calls</li>
<li>2,000 swarm cycles</li>
<li>Webhook + priority</li>
</ul>
<a href="/signup?plan=business" class="block text-center px-4 py-2.5 rounded-lg border border-slate-700 hover:border-slate-600 text-sm">Pilih Business</a>
</div>
</div>
<div class="mt-6 p-6 rounded-2xl bg-gradient-to-r from-amber-500/5 to-transparent border border-amber-500/30 flex flex-wrap items-center justify-between gap-4">
<div>
<div class="text-sm text-amber-400 font-medium">Enterprise</div>
<div class="text-2xl font-bold mt-1">Custom pricing</div>
<p class="text-xs text-slate-400 mt-1">SLA + dedicated support + on-premise + custom integration</p>
</div>
<a href="mailto:sales@northerncoastgroup.com" class="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-semibold text-sm">Contact Sales</a>
</div>
<p class="text-center text-xs text-slate-500 mt-6">Bayar via Touch n Go eWallet. Batal bila-bila. Tiada lock-in.</p>
</section>
<section class="max-w-3xl mx-auto px-6 py-16">
<h2 class="text-3xl font-bold text-center mb-10">Soalan Lazim</h2>
<div class="space-y-3">
<details class="p-4 rounded-xl bg-slate-900 border border-slate-800">
<summary class="font-medium cursor-pointer">Saya tak tahu coding. Boleh guna?</summary>
<p class="text-sm text-slate-400 mt-2">Boleh. Taip apa yang anda mahu dalam Bahasa Melayu atau English. BorneoAI handle semua.</p>
</details>
<details class="p-4 rounded-xl bg-slate-900 border border-slate-800">
<summary class="font-medium cursor-pointer">Berapa lama untuk app live?</summary>
<p class="text-sm text-slate-400 mt-2">Bergantung complexity. Simple site: minit. SaaS penuh: jam hingga hari.</p>
</details>
<details class="p-4 rounded-xl bg-slate-900 border border-slate-800">
<summary class="font-medium cursor-pointer">Data saya selamat?</summary>
<p class="text-sm text-slate-400 mt-2">Ya. Semua di Edge. Audit log SHA-256. Multi-tenant isolation.</p>
</details>
<details class="p-4 rounded-xl bg-slate-900 border border-slate-800">
<summary class="font-medium cursor-pointer">Boleh integrate dengan sistem sedia ada?</summary>
<p class="text-sm text-slate-400 mt-2">Boleh. BorneoAI expose REST API + webhook. Team anda boleh integrate.</p>
</details>
</div>
</section>
<section class="max-w-3xl mx-auto px-6 py-16">
<div class="p-8 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/50 border border-slate-800 text-center">
<h2 class="text-3xl font-bold mb-4">Ready to build?</h2>
<p class="text-slate-400 mb-6">Sign up dan dapat API key dalam 30 saat.</p>
<a href="/signup" class="inline-block px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold">Mula Sekarang →</a>
</div>
</section>
</main>
<footer class="border-t border-slate-800 mt-16">
<div class="max-w-6xl mx-auto px-6 py-8 text-sm text-slate-500 flex flex-wrap items-center justify-between gap-4">
<div>@${year} ${app} — NORTHERNCOAST GROUP<br><span class="text-xs text-slate-600">Sabah, Malaysia</span></div>
<div class="flex gap-4">
<a href="/docs" class="hover:text-slate-300">Docs</a>
<a href="/login" class="hover:text-slate-300">Login</a>
<a href="/status" class="hover:text-slate-300">Status</a>
<a href="/legal/terms" class="hover:text-slate-300">Terms</a>
</div>
</div>
</footer>

<!-- BAOBAO WIDGET -->
<a href="/app/chat" id="bb-btn" style="position:fixed;bottom:20px;right:20px;z-index:100;width:64px;height:64px;border-radius:50%;padding:0;overflow:hidden;border:2px solid rgba(16,185,129,.5);cursor:pointer;box-shadow:0 8px 24px rgba(16,185,129,.4),0 0 40px rgba(6,182,212,.25);transition:transform .25s;background:#020617;display:block;text-decoration:none" onmouseover="this.style.transform='scale(1.08)'" onmouseout="this.style.transform='scale(1)'"><img src="https://raw.githubusercontent.com/vmojuga-pixel/Argon/main/dolphin.png" alt="Baobao" style="width:100%;height:100%;object-fit:cover;object-position:center 15%;display:block"/></a>
<div id="bb-panel" style="position:fixed;bottom:88px;right:20px;z-index:100;width:min(380px,calc(100vw - 40px));height:min(560px,calc(100vh - 120px));background:linear-gradient(135deg,rgba(15,23,42,.97),rgba(15,23,42,.92));backdrop-filter:blur(20px);border:1px solid rgba(148,163,184,.2);border-radius:1.25rem;box-shadow:0 20px 60px rgba(0,0,0,.6),0 0 80px rgba(16,185,129,.15);display:none;flex-direction:column;overflow:hidden">
<div style="padding:14px 16px;border-bottom:1px solid rgba(148,163,184,.12);display:flex;align-items:center;gap:10px">
<img src="https://raw.githubusercontent.com/vmojuga-pixel/Argon/main/dolphin.png" style="width:36px;height:36px;border-radius:12px;object-fit:cover;object-position:center top;border:1px solid rgba(148,163,184,.2)" />
<div style="flex:1"><div style="font-weight:600;font-size:14px">Baobao</div><div style="font-size:11px;color:#64748b">Autocode assistant</div></div>
<button onclick="bbToggle()" style="background:none;border:none;color:#64748b;cursor:pointer;font-size:18px">&#10005;</button>
</div>
<div id="bb-msgs" style="flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px">
<div style="background:rgba(15,23,42,.7);border:1px solid rgba(148,163,184,.12);border-radius:14px;padding:12px;font-size:13px;line-height:1.5">Hai! Saya Baobao 🪐 Tanya apa saja pasal BorneoAI. Atau klik soalan popular bawah 👇</div>
<div id="bb-chips" style="display:flex;flex-wrap:wrap;gap:6px">
<button onclick="bbSend('Apa itu BorneoAI?')" style="background:rgba(16,185,129,.1);border:1px solid rgba(16,185,129,.3);color:#22d3ee;padding:6px 12px;border-radius:20px;font-size:12px;cursor:pointer">Apa itu BorneoAI?</button>
<button onclick="bbSend('Berapa harga?')" style="background:rgba(16,185,129,.1);border:1px solid rgba(16,185,129,.3);color:#22d3ee;padding:6px 12px;border-radius:20px;font-size:12px;cursor:pointer">Berapa harga?</button>
<button onclick="bbSend('Boleh buat apa?')" style="background:rgba(16,185,129,.1);border:1px solid rgba(16,185,129,.3);color:#22d3ee;padding:6px 12px;border-radius:20px;font-size:12px;cursor:pointer">Boleh buat apa?</button>
</div>
</div>
<div style="padding:12px;border-top:1px solid rgba(148,163,184,.12);display:flex;gap:8px">
<input id="bb-in" type="text" placeholder="Tanya Baobao..." style="flex:1;background:rgba(2,6,23,.6);border:1px solid rgba(148,163,184,.15);border-radius:12px;padding:10px 14px;color:#e2e8f0;font-size:13px;outline:none" onkeydown="if(event.key==='Enter')bbSend()" />
<button onclick="bbSend()" style="background:linear-gradient(180deg,#06b6d4,#0891b2);border:none;color:#020617;padding:10px 16px;border-radius:12px;font-weight:600;font-size:13px;cursor:pointer">&#8594;</button>
</div>
<div id="bb-count" style="padding:0 12px 8px;font-size:11px;color:#64748b;text-align:right"></div>
</div>
<script>
function bbToggle(){var p=document.getElementById('bb-panel');p.style.display=p.style.display==='flex'?'none':'flex';if(p.style.display==='flex')document.getElementById('bb-in').focus();}
function bbAdd(role,text){var m=document.getElementById('bb-msgs');var d=document.createElement('div');var esc=String(text).replace(/</g,'&lt;').split(String.fromCharCode(10)).join('<br>');if(role==='user'){d.style.cssText='align-self:flex-end;background:linear-gradient(135deg,#06b6d4,#0891b2);color:#020617;padding:10px 14px;border-radius:14px;font-size:13px;max-width:80%;font-weight:500';d.innerHTML=esc;}else{d.style.cssText='background:rgba(15,23,42,.7);border:1px solid rgba(148,163,184,.12);border-radius:14px;padding:12px;font-size:13px;line-height:1.5;max-width:90%';d.innerHTML=esc;}m.appendChild(d);m.scrollTop=m.scrollHeight;}
var bbBusy=false;
async function bbSend(preset){if(bbBusy)return;var i=document.getElementById('bb-in');var t=preset||i.value.trim();if(!t)return;i.value='';var c=document.getElementById('bb-chips');if(c)c.remove();bbAdd('user',t);var th=document.createElement('div');th.id='bb-th';th.style.cssText='color:#64748b;font-size:12px;padding:8px';th.textContent='Baobao sedang fikir...';document.getElementById('bb-msgs').appendChild(th);bbBusy=true;try{var r=await fetch('/api/baobao',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:t})});var d=await r.json();document.getElementById('bb-th').remove();if(d.ok){bbAdd('ai',d.reply);var cd=document.getElementById('bb-count');if(d.remaining<=2&&d.remaining>=0)cd.textContent='Baki: '+d.remaining+' chat hari ini';}else if(d.error==='limit_reached'){bbAdd('ai','Limit 5 chat/hari dah habis 😅 Sign up free untuk unlimited! \n\n👉 /signup');}else{bbAdd('ai','Maaf, ada masalah teknikal. Cuba lagi.');}}catch(e){var th2=document.getElementById('bb-th');if(th2)th2.remove();bbAdd('ai','Error: '+e.message);}bbBusy=false;}
</script>
</body>
</html>`;
}
