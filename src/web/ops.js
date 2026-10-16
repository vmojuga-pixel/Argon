import { BAOBAO_AVATAR } from "./baobao-asset.js";

export function renderOps(env) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Baobao Ops</title><script src="https://cdn.tailwindcss.com"></script>
<style>body{background:#030509;color:#e2e8f0;font-family:system-ui,sans-serif;margin:0}.card{background:rgba(15,23,42,.6);border:1px solid rgba(148,163,184,.15);border-radius:14px;padding:18px;margin-bottom:14px}.btn{background:linear-gradient(180deg,#10b981,#059669);border:none;color:#020617;padding:11px 20px;border-radius:11px;font-weight:600;font-size:14px;cursor:pointer}.btn:hover{opacity:.9}.btn2{background:rgba(148,163,184,.15);color:#e2e8f0}.btn2:hover{background:rgba(148,163,184,.25)}.file{background:rgba(2,6,23,.6);border:1px solid rgba(148,163,184,.1);border-radius:10px;padding:12px;margin-top:8px;font-family:ui-monospace,monospace;font-size:12px}textarea{width:100%;background:rgba(2,6,23,.8);border:1px solid #334155;border-radius:12px;padding:14px;color:#e2e8f0;font-size:14px;font-family:inherit;resize:vertical;outline:none}textarea:focus{border-color:#10b981}</style></head>
<body>
<div style="max-width:900px;margin:0 auto;padding:20px">
<div style="display:flex;align-items:center;gap:12px;margin-bottom:24px">
<img src="${BAOBAO_AVATAR}" style="width:44px;height:44px;border-radius:14px;object-fit:cover;object-position:center 15%;border:2px solid rgba(16,185,129,.4)"/>
<div style="flex:1"><div style="font-weight:700;font-size:18px">Baobao Ops</div><div style="font-size:12px;color:#64748b">Taip arahan. Baobao cadang. Kau approve. Auto-deploy.</div></div>
<a href="/app" style="color:#64748b;font-size:13px;text-decoration:none">Console &rarr;</a>
</div>

<div class="card">
<div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#64748b;margin-bottom:8px">Arahan</div>
<textarea id="dir" rows="4" placeholder="Contoh: Tukar hero landing jadi warna biru, atau tambah endpoint /api/stats yang return jumlah tenant"></textarea>
<div style="margin-top:12px;display:flex;gap:8px">
<button id="planBtn" class="btn" onclick="doPlan()">Cadang Plan</button>
<button class="btn btn2" onclick="clearAll()">Reset</button>
</div>
</div>

<div id="out"></div>
</div>
<script>
async function doPlan(){
  var d = document.getElementById("dir").value.trim();
  if(!d){alert("Taip arahan dulu");return;}
  var out = document.getElementById("out");
  var btn = document.getElementById("planBtn");
  btn.disabled = true; btn.textContent = "Baobao sedang fikir...";
  out.innerHTML = '<div class="card" style="color:#64748b;font-size:13px">Baobao baca repo + fikir plan...</div>';
  try{
    var r = await fetch("/api/ops/plan",{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({directive:d})});
    var res = await r.json();
    if(!res.ok){out.innerHTML = '<div class="card" style="color:#f87171">Error: '+(res.error||"unknown")+'</div>';btn.disabled=false;btn.textContent="Cadang Plan";return;}
    var html = '<div class="card"><div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#10b981;margin-bottom:6px">Plan</div><div style="font-size:15px;font-weight:600;margin-bottom:14px">'+esc(res.summary)+'</div>';
    res.files.forEach(function(f,i){
      html += '<div class="file"><div style="color:#10b981;font-weight:600;margin-bottom:6px">'+(f.action==="create"?"[NEW] ":"[EDIT] ")+esc(f.path)+'</div>';
      html += '<div style="color:#64748b;font-size:11px;margin-bottom:8px">Saiz: '+f.oldSize+' &rarr; '+f.newSize+' bytes</div>';
      html += '<div style="white-space:pre-wrap;max-height:240px;overflow:auto;color:#cbd5e1">'+esc(f.preview)+'</div></div>';
    });
    html += '<div style="margin-top:16px;display:flex;gap:8px"><button class="btn" onclick="doApply()">Approve &amp; Deploy</button><button class="btn btn2" onclick="clearAll()">Batal</button></div></div>';
    out.innerHTML = html;
    window._plan = res;
    btn.disabled=false;btn.textContent="Cadang Plan";
  }catch(e){out.innerHTML='<div class="card" style="color:#f87171">Error: '+e.message+'</div>';btn.disabled=false;btn.textContent="Cadang Plan";}
}
async function doApply(){
  if(!window._plan){return;}
  var out = document.getElementById("out");
  out.innerHTML += '<div class="card" style="color:#64748b;font-size:13px">Commit ke GitHub...</div>';
  try{
    var r = await fetch("/api/ops/apply",{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({plan:window._plan,summary:window._plan.summary})});
    var res = await r.json();
    var html = '<div class="card"><div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#10b981;margin-bottom:6px">Hasil</div><div style="font-size:15px;font-weight:600;margin-bottom:10px">'+esc(res.message||"")+'</div>';
    if(res.results)res.results.forEach(function(x){
      html += '<div class="file"><span style="color:'+(x.ok?"#10b981":"#f87171")+'">'+(x.ok?"\u2705":"\u274c")+' '+esc(x.path)+'</span>'+(x.sha?' <span style="color:#64748b">@'+x.sha+'</span>':'')+(x.error?' <span style="color:#f87171">'+esc(x.error)+'</span>':'')+'</div>';
    });
    html += '<div style="margin-top:12px;color:#64748b;font-size:12px">GitHub Actions akan auto-deploy dalam ~1 minit. Refresh site untuk tengok hasil.</div>';
    html += '<div style="margin-top:14px"><button class="btn" onclick="clearAll()">Arahan Baru</button></div></div>';
    out.innerHTML = html;
  }catch(e){out.innerHTML += '<div class="card" style="color:#f87171">Error: '+e.message+'</div>';}
}
function esc(s){return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}
function clearAll(){document.getElementById("out").innerHTML="";document.getElementById("dir").value="";window._plan=null;}
</script>
</body></html>`;
}
