const EDGE_DATABASE = {
  items: [
    { id: "REC-101", title: "Full stack demo untuk test E", category: "PRODUCTION", amount: 1250.00, status: "VERIFIED", createdAt: new Date().toISOString() },
    { id: "REC-102", title: "Watchdog node 24/7", category: "INFRA", amount: 480.50, status: "ACTIVE", createdAt: new Date().toISOString() }
  ]
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" };
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });

    if (url.pathname === "/health") {
      return new Response(JSON.stringify({ status: "HEALTHY", app: "omni-e2e-6101", records: EDGE_DATABASE.items.length, ts: Date.now() }), { headers: { ...cors, "Content-Type": "application/json" } });
    }

    if (url.pathname === "/api/items" && request.method === "GET") {
      const total = EDGE_DATABASE.items.reduce((s, i) => s + Number(i.amount || 0), 0);
      return new Response(JSON.stringify({ items: EDGE_DATABASE.items, metrics: { totalCount: EDGE_DATABASE.items.length, totalValue: total.toFixed(2) } }), { headers: { ...cors, "Content-Type": "application/json" } });
    }

    if (url.pathname === "/api/items" && request.method === "POST") {
      const body = await request.json();
      const newItem = { id: "REC-" + Math.floor(100 + Math.random() * 900), title: String(body.title || "Item").slice(0, 120), category: String(body.category || "GENERAL").toUpperCase(), amount: parseFloat(body.amount || 0), status: "ACTIVE", createdAt: new Date().toISOString() };
      EDGE_DATABASE.items.unshift(newItem);
      return new Response(JSON.stringify({ created: true, item: newItem }), { headers: { ...cors, "Content-Type": "application/json" } });
    }

    if (url.pathname.startsWith("/api/items/") && request.method === "DELETE") {
      const id = url.pathname.split("/").pop();
      EDGE_DATABASE.items = EDGE_DATABASE.items.filter((i) => i.id !== id);
      return new Response(JSON.stringify({ deleted: true, id }), { headers: { ...cors, "Content-Type": "application/json" } });
    }

    const html = `<!DOCTYPE html><html lang="ms" class="dark"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>OMNI-E2E-6101</title><script src="https://cdn.tailwindcss.com"><\/script></head><body class="bg-slate-950 text-slate-100 font-sans min-h-screen p-6"><div class="max-w-6xl mx-auto"><header class="border-b border-slate-800 pb-4 mb-6 flex items-center justify-between"><div class="flex items-center gap-3"><span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span><span class="font-mono font-bold">OMNI-E2E-6101</span><span class="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">E2E</span></div><div class="text-xs font-mono text-slate-400">API: /api/items | Health: /health</div></header><div class="grid grid-cols-1 lg:grid-cols-12 gap-6"><div class="lg:col-span-4 space-y-6"><div class="bg-slate-900 border border-slate-800 rounded-xl p-5"><div class="text-xs font-mono text-emerald-400 font-bold mb-1">// SPEC</div><h1 class="text-base font-bold text-white mb-2">Full stack demo untuk test E2E build</h1><p class="text-xs text-slate-400">Berikut adalah 2 ayat ringkas tentang spesifikasi seni bina full-stack dalam Bahasa Malaysia:

Seni bina full-stack merujuk kepada reka bentuk dan pembangunan sistem perisian yang melibatkan semua lapisan, dari bahagian hadapan (front-end) sehingga bahagian belakang (back-end), termasuk pangkalan da</p></div><div class="bg-slate-900 border border-slate-800 rounded-xl p-5"><h2 class="text-xs font-mono uppercase text-cyan-400 font-bold mb-3">Add Record</h2><input id="t" placeholder="Title" class="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white mb-2"><input id="c" placeholder="Category" class="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white mb-2"><input id="a" type="number" step="0.01" placeholder="Amount" class="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white mb-2"><button onclick="add()" class="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-lg text-xs">SAVE</button></div></div><div class="lg:col-span-8 space-y-4"><div class="grid grid-cols-2 gap-4 font-mono"><div class="bg-slate-900 border border-slate-800 rounded-xl p-4"><div class="text-xs text-slate-400">COUNT</div><div id="s1" class="text-2xl font-bold text-white">0</div></div><div class="bg-slate-900 border border-slate-800 rounded-xl p-4"><div class="text-xs text-slate-400">VALUE</div><div id="s2" class="text-2xl font-bold text-emerald-400">$0</div></div></div><div class="bg-slate-900 border border-slate-800 rounded-xl p-5"><div id="list" class="space-y-2 font-mono text-xs"></div></div></div></div></div><script>async function load(){const r=await fetch("/api/items");const d=await r.json();document.getElementById("s1").innerText=d.metrics.totalCount;document.getElementById("s2").innerText="$"+d.metrics.totalValue;document.getElementById("list").innerHTML=d.items.map(i=>'<div class="p-3 bg-slate-950 border border-slate-800 rounded-lg flex justify-between"><div><span class="text-emerald-400 font-bold">['+i.id+']</span> <span class="text-white font-bold">'+i.title+'</span> <span class="text-cyan-300 text-xs">'+i.category+'</span></div><div><span class="text-amber-300 mr-3">$'+Number(i.amount).toFixed(2)+'</span><button onclick="del(\''+i.id+'\')" class="text-rose-400 text-xs">DEL</button></div></div>').join("");}async function add(){const t=document.getElementById("t").value;if(!t)return;await fetch("/api/items",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({title:t,category:document.getElementById("c").value,amount:document.getElementById("a").value})});document.getElementById("t").value="";load();}async function del(id){await fetch("/api/items/"+id,{method:"DELETE"});load();}load();<\/script></body></html>`;
    return new Response(html, { headers: { "Content-Type": "text/html;charset=UTF-8" } });
  }
};