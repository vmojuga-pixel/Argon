const CSS = `
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
*{font-family:'Inter',system-ui,sans-serif}
body{background:#09090b;color:#e4e4e7;margin:0;}
.card{background:#18181b;border:1px solid #27272a;border-radius:6px;padding:24px;}
.btn{background:#10b981;color:#022c22;padding:8px 16px;border-radius:6px;font-weight:500;font-size:14px;border:none;cursor:pointer;transition:0.2s;}
.btn:hover{background:#059669;}
.nav-item{display:flex;align-items:center;gap:12px;padding:8px 12px;border-radius:6px;color:#a1a1aa;text-decoration:none;font-size:14px;font-weight:500;transition:all 0.2s;}
.nav-item:hover{background:#27272a;color:#e4e4e7;}
.nav-item.active{background:#27272a;color:#e4e4e7;}
.nav-item.active svg{color:#10b981;}
.bub-user{background:#10b981;color:#022c22;padding:10px 14px;border-radius:6px;max-width:80%;align-self:flex-end;font-size:14px;}
.bub-ai{background:#18181b;border:1px solid #27272a;padding:10px 14px;border-radius:6px;max-width:85%;font-size:14px;line-height:1.5;}
textarea{background:#09090b;border:1px solid #27272a;color:#e4e4e7;border-radius:6px;padding:12px;font-size:14px;width:100%;box-sizing:border-box;resize:none;}
textarea:focus{outline:none;border-color:#10b981;}
::-webkit-scrollbar{width:6px;height:6px}
::-webkit-scrollbar-thumb{background:#3f3f46;border-radius:3px}
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
  <title>${app} - Console</title>
  <script src="https://cdn.tailwindcss.com"></script>
  ${CSS}
  </head>
  <body class="antialiased flex h-screen overflow-hidden">
    <aside id="sb" class="w-64 border-r border-[#27272a] bg-[#09090b] flex flex-col h-full fixed md:static inset-y-0 z-40 hidden md:flex">
      <div class="h-16 flex items-center justify-between px-6 border-b border-[#27272a]">
        <span class="font-bold text-lg text-white tracking-tight">${app}</span>
        <button onclick="document.getElementById('sb').classList.add('hidden')" class="md:hidden text-gray-400 hover:text-white">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
      <nav class="flex-1 p-4 space-y-1 overflow-y-auto">${sidebar}</nav>
      <div class="p-4 border-t border-[#27272a]">
        <div class="flex items-center gap-3 mb-4 px-2">
          <div class="w-8 h-8 rounded-full bg-[#27272a] flex items-center justify-center text-sm font-medium text-white">${initial}</div>
          <div class="flex-1 min-w-0">
            <div class="text-sm font-medium text-white truncate">${username}</div>
            <div class="text-xs text-gray-500 truncate">${user}</div>
          </div>
        </div>
        <button onclick="logout()" class="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] rounded-md text-sm font-medium text-gray-300 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          Log out
        </button>
      </div>
    </aside>
    <div class="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
      <header class="h-16 border-b border-[#27272a] bg-[#09090b] flex items-center px-4 gap-3 shrink-0">
        <button onclick="document.getElementById('sb').classList.remove('hidden')" class="md:hidden text-gray-400 hover:text-white">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </button>
        <h1 class="font-semibold text-sm capitalize text-white flex-1">${view}</h1>
        <a href="/docs" class="text-xs text-gray-400 hover:text-white transition">Docs</a>
      </header>
      <main class="flex-1 overflow-y-auto h-full">${content}</main>
    </div>
  <script>function logout(){fetch('/api/auth/logout',{method:'POST',credentials:'include'}).then(function(){window.location.href='/';});}</script>
  </body></html>`;
}

function vHome(){return `<div class="p-8 max-w-4xl mx-auto">
<h2 class="text-2xl font-semibold mb-6">Welcome back</h2>
<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
<div class="card"><h3 class="font-medium text-gray-200 mb-2">Tanya Baobao</h3><p class="text-sm text-gray-400 mb-4">Bina sistem, tanya kod, atau automasi kerja anda.</p><a href="/app/chat" class="btn inline-block">Mula Chat</a></div>
<div class="card"><h3 class="font-medium text-gray-200 mb-2">API Key</h3><p class="text-sm text-gray-400 mb-4">Dapatkan kunci akses untuk integrasi sistem luar.</p><a href="/app/keys" class="btn inline-block">Lihat API Key</a></div>
</div>

</div>`;}

function vChat(){return `<div class="h-full flex flex-col bg-[#09090b]">
<div id="msgs" class="flex-1 overflow-y-auto p-4 md:p-8 w-full">
<div id="welcome" class="max-w-3xl mx-auto mt-8 mb-8 text-center fade-in">
  <div class="w-16 h-16 rounded-2xl bg-[#18181b] border border-[#27272a] flex items-center justify-center mx-auto mb-6 shadow-sm">
    <svg class="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
  </div>
  <h1 class="text-2xl md:text-3xl font-semibold text-white mb-2">Tanya Baobao</h1>
  <p class="text-gray-400 mb-8">Apa yang kita nak buat hari ini?</p>
  
  <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
    <button onclick="fillChat('Bina sistem tempahan untuk salon')" class="p-4 rounded-xl border border-[#27272a] bg-[#18181b] hover:bg-[#27272a] transition-colors group">
      <div class="font-medium text-white mb-1 flex items-center gap-2"><svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg> Bina Sistem</div>
      <div class="text-xs text-gray-400 group-hover:text-gray-300">Sistem tempahan, e-commerce, atau CRM ringkas.</div>
    </button>
    <button onclick="fillChat('Tulis kod HTML dan Tailwind untuk landing page company profile')" class="p-4 rounded-xl border border-[#27272a] bg-[#18181b] hover:bg-[#27272a] transition-colors group">
      <div class="font-medium text-white mb-1 flex items-center gap-2"><svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg> Tulis Kod</div>
      <div class="text-xs text-gray-400 group-hover:text-gray-300">HTML, CSS, JavaScript, atau Python.</div>
    </button>
    <button onclick="fillChat('Buat automation untuk hantar email mingguan')" class="p-4 rounded-xl border border-[#27272a] bg-[#18181b] hover:bg-[#27272a] transition-colors group">
      <div class="font-medium text-white mb-1 flex items-center gap-2"><svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg> Automasi</div>
      <div class="text-xs text-gray-400 group-hover:text-gray-300">Kerja berulang, cron job, atau webhook.</div>
    </button>
    <button onclick="fillChat('Jelaskan macam mana nak guna API key Argon')" class="p-4 rounded-xl border border-[#27272a] bg-[#18181b] hover:bg-[#27272a] transition-colors group">
      <div class="font-medium text-white mb-1 flex items-center gap-2"><svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Tanya Soalan</div>
      <div class="text-xs text-gray-400 group-hover:text-gray-300">Pasal API, dokumentasi, atau cara guna.</div>
    </button>
  </div>
</div>
</div>

<div class="p-4 bg-[#09090b] shrink-0">
  <form id="chat-form" class="w-full max-w-3xl mx-auto relative">
    <input id="chat-input" type="text" placeholder="Taip arahan atau soalan anda di sini..." autocomplete="off" class="w-full bg-[#18181b] border border-[#27272a] rounded-xl pl-4 pr-14 py-3.5 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors placeholder-gray-500"/>
    <button type="submit" class="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-emerald-500 hover:bg-emerald-400 rounded-lg text-[#09090b] transition-colors flex items-center justify-center">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
    </button>
  </form>
  <div class="text-center mt-2"><span class="text-[10px] text-gray-500">Baobao boleh melakukan kesilapan. Sila semak kod penting.</span></div>
</div>
<script>
window.fillChat = function(text) {
  const input = document.getElementById('chat-input');
  input.value = text;
  input.focus();
};

document.getElementById('chat-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const input = document.getElementById('chat-input');
  const msg = input.value.trim();
  if(!msg) return;
  input.value = '';
  
  const welcome = document.getElementById('welcome');
  if(welcome) welcome.remove();
  
  const container = document.getElementById('msgs');
  
  const userDiv = document.createElement('div');
  userDiv.className = 'max-w-3xl mx-auto flex justify-end fade-in mb-4';
  userDiv.innerHTML = '<div class="bub-user">' + msg.replace(/</g,'&lt;') + '</div>';
  container.appendChild(userDiv);
  container.scrollTop = container.scrollHeight;
  
  const loadDiv = document.createElement('div');
  loadDiv.id = 'loading-msg';
  loadDiv.className = 'max-w-3xl mx-auto flex justify-start fade-in mb-4';
  loadDiv.innerHTML = '<div class="bub-ai text-gray-400 flex items-center gap-2"><svg class="animate-spin h-4 w-4 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Baobao sedang berfikir...</div>';
  container.appendChild(loadDiv);
  container.scrollTop = container.scrollHeight;
  
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg })
    });
    const data = await res.json();
    document.getElementById('loading-msg').remove();
    
    const aiDiv = document.createElement('div');
    aiDiv.className = 'max-w-3xl mx-auto flex justify-start fade-in mb-4';
    let replyText = '';
    if(data.ok && data.reply) {
       replyText = data.reply;
    } else if (data.error === 'quota exceeded') {
       replyText = 'Kuota chat anda telah habis. Sila upgrade pelan anda.';
    } else {
       replyText = 'Ralat Sistem: ' + (data.error || 'Tiada respon dari AI.');
    }
    aiDiv.innerHTML = '<div class="bub-ai">' + replyText.replace(/</g,'&lt;').split(String.fromCharCode(10)).join('<br>') + '</div>';
    container.appendChild(aiDiv);
    container.scrollTop = container.scrollHeight;
  } catch (err) {
    document.getElementById('loading-msg').remove();
    const errDiv = document.createElement('div');
    errDiv.className = 'max-w-3xl mx-auto flex justify-start fade-in mb-4';
    errDiv.innerHTML = '<div class="bub-ai text-red-400">Error: ' + err.message + '</div>';
    container.appendChild(errDiv);
  }
});
</script></div>`;};

document.getElementById('chat-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const input = document.getElementById('chat-input');
  const msg = input.value.trim();
  if(!msg) return;
  input.value = '';
  
  const welcome = document.getElementById('welcome');
  if(welcome) welcome.remove();
  
  const container = document.getElementById('msgs');
  
  const userDiv = document.createElement('div');
  userDiv.className = 'max-w-3xl mx-auto flex justify-end fade-in mb-4';
  userDiv.innerHTML = '<div class="bub-user">' + msg.replace(/</g,'&lt;') + '</div>';
  container.appendChild(userDiv);
  container.scrollTop = container.scrollHeight;
  
  const loadDiv = document.createElement('div');
  loadDiv.id = 'loading-msg';
  loadDiv.className = 'max-w-3xl mx-auto flex justify-start fade-in mb-4';
  loadDiv.innerHTML = '<div class="bub-ai text-gray-400 flex items-center gap-2"><svg class="animate-spin h-4 w-4 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Baobao sedang berfikir...</div>';
  container.appendChild(loadDiv);
  container.scrollTop = container.scrollHeight;
  
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg })
    });
    const data = await res.json();
    document.getElementById('loading-msg').remove();
    
    const aiDiv = document.createElement('div');
    aiDiv.className = 'max-w-3xl mx-auto flex justify-start fade-in mb-4';
    let replyText = '';
    if(data.ok && data.reply) {
       replyText = data.reply;
    } else if (data.error === 'quota exceeded') {
       replyText = 'Kuota chat anda telah habis. Sila upgrade pelan anda.';
    } else {
       replyText = 'Ralat Sistem: ' + (data.error || 'Tiada respon dari AI.');
    }
    aiDiv.innerHTML = '<div class="bub-ai">' + replyText.replace(/</g,'&lt;').split(String.fromCharCode(10)).join('<br>') + '</div>';
    container.appendChild(aiDiv);
    container.scrollTop = container.scrollHeight;
  } catch (err) {
    document.getElementById('loading-msg').remove();
    const errDiv = document.createElement('div');
    errDiv.className = 'max-w-3xl mx-auto flex justify-start fade-in mb-4';
    errDiv.innerHTML = '<div class="bub-ai text-red-400">Error: ' + err.message + '</div>';
    container.appendChild(errDiv);
  }
});
</script></div>`;}
</script></div>`;}

function vOps(){return `<div class="p-8 max-w-4xl mx-auto fade-in">
<h2 class="text-2xl font-semibold mb-6">Ops Console</h2>
<p class="text-sm text-gray-400 mb-6">Taip arahan. Baobao cadang plan. Approve untuk deploy.</p>
<div class="card mb-6"><textarea id="opdir" rows="3" placeholder="Contoh: Tukar warna hero landing jadi biru..."></textarea>
<div class="mt-3 flex gap-2"><button id="opbtn" onclick="runOps()" class="btn">Cadang Plan</button><button onclick="clearOps()" class="bg-[#27272a] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#3f3f46]">Reset</button></div></div>
<div id="opout"></div>
<script>
async function runOps(){
  var d=document.getElementById("opdir").value.trim(); if(!d){alert("Taip arahan dulu");return;}
  var b=document.getElementById("opbtn"); b.disabled=true; b.textContent="Baobao fikir...";
  var o=document.getElementById("opout"); o.innerHTML='<div class="text-sm text-gray-400">Menganalisa repo...</div>';
  try{
    var r=await fetch("/api/ops/plan",{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({directive:d})});
    var res=await r.json();
    if(!res.ok){o.innerHTML='<div class="text-red-400 text-sm">Error: '+(res.error||"unknown")+'</div>';b.disabled=false;b.textContent="Cadang Plan";return;}
    var h='<div class="card border-emerald-500/30"><div class="text-xs uppercase tracking-wider text-emerald-500 mb-2 font-semibold">Plan</div><div class="text-base font-medium mb-4">'+res.summary+'</div>';
    res.files.forEach(function(f){h+='<div class="p-3 rounded-md bg-[#09090b] border border-[#27272a] mb-2 font-mono text-xs"><div class="text-emerald-400 font-semibold mb-1">'+(f.action==="create"?"[NEW] ":"[EDIT] ")+f.path+'</div><div class="text-gray-500 mb-2">'+f.oldSize+' &rarr; '+f.newSize+' bytes</div><div class="whitespace-pre-wrap max-h-48 overflow-auto text-gray-300">'+f.preview+'</div></div>';});
    h+='<div class="mt-4 flex gap-2"><button onclick="applyOps()" class="btn">Approve & Deploy</button><button onclick="clearOps()" class="bg-[#27272a] text-white px-4 py-2 rounded-md text-sm">Batal</button></div></div>';
    o.innerHTML=h; window._oplan=res; b.disabled=false; b.textContent="Cadang Plan";
  }catch(e){o.innerHTML='<div class="text-red-400 text-sm">Error: '+e.message+'</div>';b.disabled=false;b.textContent="Cadang Plan";}
}
async function applyOps(){
  if(!window._oplan)return; var o=document.getElementById("opout");
  o.innerHTML+='<div class="text-sm text-gray-400 mt-4">Commit ke GitHub...</div>';
  try{
    var r=await fetch("/api/ops/apply",{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({plan:window._oplan,summary:window._oplan.summary})});
    var res=await r.json();
    var h='<div class="card mt-4"><div class="text-xs uppercase tracking-wider text-emerald-500 mb-2 font-semibold">Hasil</div><div class="font-medium mb-4">'+(res.message||"")+'</div>';
    if(res.results)res.results.forEach(function(x){h+='<div class="text-xs font-mono py-1">'+(x.ok?"OK":"FAIL")+' '+x.path+(x.sha?' @'+x.sha:'')+'</div>';});
    h+='<div class="mt-4 text-xs text-gray-500">GitHub Actions auto-deploy ~1 minit.</div></div>';
    o.innerHTML=h;
  }catch(e){o.innerHTML+='<div class="text-red-400 text-sm mt-2">Error: '+e.message+'</div>';}
}
function clearOps(){document.getElementById("opout").innerHTML="";document.getElementById("opdir").value="";window._oplan=null;}
</script></div>`;}

function vBaobao(){return vChat();}

function vBuild(){return `<div class="p-8 max-w-3xl mx-auto"><h2 class="text-2xl font-semibold mb-2">Bina App</h2><p class="text-sm text-gray-400 mb-6">Terangkan apa yang anda nak. Baobao bina full-stack Worker.</p><div class="card"><textarea placeholder="Contoh: Bina sistem tempahan kedai gunting dengan admin panel..." rows="5"></textarea><button class="btn mt-4">Bina Sekarang</button></div></div>`;}
function vProjects(){return `<div class="p-8 max-w-4xl mx-auto"><h2 class="text-2xl font-semibold mb-6">Projects</h2><div class="card text-center py-12"><div class="text-gray-500 text-sm">Belum ada project. <a href="/app/build" class="text-emerald-500">Bina sekarang</a></div></div></div>`;}
function vKeys(){return `<div class="p-8 max-w-3xl mx-auto"><h2 class="text-2xl font-semibold mb-6">API Keys</h2><div class="card"><div class="text-xs uppercase tracking-wider text-gray-500 mb-3">Your API Key</div><div class="flex"><code id="k" class="flex-1 bg-[#09090b] border border-[#27272a] rounded-md px-4 py-2.5 text-xs font-mono truncate text-emerald-400">Loading...</code><button onclick="navigator.clipboard.writeText(document.getElementById('k').textContent);this.textContent='Copied!'" class="ml-2 px-4 py-2.5 bg-[#27272a] hover:bg-[#3f3f46] rounded-md text-sm">Copy</button></div></div></div><script>fetch("/api/me",{credentials:"include"}).then(function(r){return r.json();}).then(function(d){document.getElementById("k").textContent=d.apiKey||d.key||"Not available";}).catch(function(){});</script>`;}
function vUsage(){return `<div class="p-8 max-w-3xl mx-auto"><h2 class="text-2xl font-semibold mb-6">Usage</h2><div class="card text-center text-gray-500 text-sm py-12">Statistik akan muncul bila anda mula guna.</div></div>`;}
function vBilling(){return `<div class="p-8 max-w-3xl mx-auto"><h2 class="text-2xl font-semibold mb-6">Billing</h2><div class="card"><div class="text-xs uppercase tracking-wider text-gray-500 mb-2">Current Plan</div><div class="text-3xl font-semibold mb-6">Free</div><a href="/#pricing" class="btn inline-block">Upgrade plan &rarr;</a></div></div>`;}
