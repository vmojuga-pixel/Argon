export function renderBaobao(env) {
  const app = (env && env.APP_NAME) || "BorneoAI";
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Baobao - ${app}</title><script src="https://cdn.tailwindcss.com"></script>
<style>body{background:#030509;color:#e2e8f0;font-family:system-ui,sans-serif;margin:0}.bub-u{background:linear-gradient(135deg,#10b981,#059669);color:#020617;padding:10px 14px;border-radius:14px;max-width:80%;align-self:flex-end;font-size:14px}.bub-a{background:rgba(30,41,59,.7);border:1px solid rgba(148,163,184,.12);padding:12px 16px;border-radius:14px;max-width:85%;font-size:14px;line-height:1.5}.msg{display:flex;margin-bottom:14px}::-webkit-scrollbar{width:6px}::-webkit-scrollbar-thumb{background:rgba(148,163,184,.2);border-radius:3px}</style></head>
<body>
<header style="padding:16px 20px;border-bottom:1px solid #1e293b;display:flex;align-items:center;gap:12px;position:sticky;top:0;background:rgba(3,7,18,.95);backdrop-filter:blur(12px);z-index:10">
<a href="/" style="color:#64748b;text-decoration:none;font-size:20px">&#8592;</a>
<div style="width:36px;height:36px;border-radius:12px;background:linear-gradient(135deg,#10b981,#06b6d4);display:flex;align-items:center;justify-content:center;font-weight:700;color:#020617;font-size:16px">B</div>
<div><div style="font-weight:600;font-size:15px">Baobao</div><div style="font-size:11px;color:#64748b">Autocode assistant</div></div>
</header>
<main id="msgs" style="max-width:800px;margin:0 auto;padding:24px 16px 100px;display:flex;flex-direction:column">
<div class="msg"><div class="bub-a">Hai! Saya Baobao 🪐 Tanya apa saja pasal ${app} atau buat apa-apa. Contoh: "Bina sistem tempahan untuk salon."</div></div>
</main>
<div style="position:fixed;bottom:0;left:0;right:0;background:rgba(3,7,18,.95);backdrop-filter:blur(12px);border-top:1px solid #1e293b;padding:12px 16px">
<form id="f" style="max-width:800px;margin:0 auto;display:flex;gap:8px">
<input id="i" type="text" placeholder="Tanya Baobao apa saja..." autocomplete="off" style="flex:1;background:rgba(15,23,42,.8);border:1px solid #334155;border-radius:12px;padding:12px 16px;color:#e2e8f0;font-size:14px;outline:none"/>
<button type="submit" style="background:linear-gradient(180deg,#10b981,#059669);border:none;color:#020617;padding:12px 20px;border-radius:12px;font-weight:600;font-size:14px;cursor:pointer">Hantar</button>
</form>
</div>
<script>
var f=document.getElementById("f"),m=document.getElementById("msgs"),i=document.getElementById("i");
function add(role,text){var w=document.createElement("div");w.className="msg";var s=String(text).split("<").join("&lt;").split(String.fromCharCode(10)).join("<br>");if(role==="u"){w.innerHTML='<div class="bub-u">'+s+'</div>';}else{w.innerHTML='<div class="bub-a">'+s+'</div>';}m.appendChild(w);window.scrollTo(0,document.body.scrollHeight);}
function thinking(){var w=document.createElement("div");w.className="msg";w.id="th";w.innerHTML='<div class="bub-a" style="color:#64748b"><span style="display:inline-block;width:14px;height:14px;border:2px solid #334155;border-top-color:#10b981;border-radius:50%;animation:s .8s linear infinite"></span> Baobao sedang fikir...</div>';m.appendChild(w);var st=document.createElement("style");st.textContent="@keyframes s{to{transform:rotate(360deg)}}";document.head.appendChild(st);window.scrollTo(0,document.body.scrollHeight);}
f.addEventListener("submit",async function(e){e.preventDefault();var t=i.value.trim();if(!t)return;i.value="";add("u",t);thinking();try{var r=await fetch("/api/baobao",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:t})});var d=await r.json();var th=document.getElementById("th");if(th)th.remove();if(d.ok){add("a",d.reply);}else if(d.error==="limit_reached"){add("a","Limit 5 chat/hari dah habis 😅 Sign up free untuk unlimited di /signup");}else{add("a","Maaf, ada masalah: "+(d.error||"unknown"));}}catch(e){var t2=document.getElementById("th");if(t2)t2.remove();add("a","Error: "+e.message);}});
</script></body></html>`;
}
