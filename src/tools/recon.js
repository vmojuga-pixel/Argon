// Ultra-light JS port of Python recon engine (for CF Workers)
export function analyzePayload(targetType, content) {
  const t0 = Date.now();
  content = String(content || '');

  const epRegex = /["']((?:https?:\/\/[^"']+)?\/(?:api|v[1-9]|auth|user|admin|payment|graphql|internal|webhook)[a-zA-Z0-9_\-/{}.]*)["']/gi;
  const paths = [...new Set([...content.matchAll(epRegex)].map(m => m[1]))];

  const secRegex = /(?:api[_-]?key|secret|token|password|aws_access)\s*[:=]\s*["']([a-zA-Z0-9_\-./=]{8,})["']/gi;
  const secrets = [...new Set([...content.matchAll(secRegex)].map(m => m[1]))];

  const fieldRegex = /\b(user_id|email|username|password_hash|created_at|amount|status|role|balance|token)\b/gi;
  const fields = [...new Set([...content.matchAll(fieldRegex)].map(m => m[1].toLowerCase()))];
  if (!fields.length) fields.push('id', 'payload', 'created_at');

  const endpoints = paths.length ? paths.map(p => ({
    method: /list|get|profile|status/.test(p) ? 'GET' : 'POST',
    endpoint: p,
    auth_required: 'Bearer / JWT'
  })) : [{ method: 'POST', endpoint: '/api/v1/inferred-action', auth_required: 'Unknown' }];

  // SQL schema
  const sqlLines = ['-- RECONSTRUCTED DDL', 'CREATE TABLE reconstructed_entity (', '    id UUID PRIMARY KEY,'];
  fields.forEach((f, i) => {
    const type = f.includes('amount') || f.includes('balance') ? 'DECIMAL(12,2)' :
                 f.includes('at') ? 'TIMESTAMP' : f.endsWith('_id') ? 'UUID' : 'VARCHAR(255)';
    sqlLines.push('    ' + f + ' ' + type + (i === fields.length - 1 ? '' : ','));
  });
  sqlLines.push(');');

  // Clean code
  const codeLines = ['# RECONSTRUCTED BACKEND', 'from fastapi import FastAPI, Header, HTTPException',
    'from pydantic import BaseModel', 'from typing import Optional', '',
    'app = FastAPI(title="Reconstructed API")', '',
    'class ReconstructedPayload(BaseModel):'];
  fields.forEach(f => codeLines.push('    ' + f + ': Optional[str] = None'));
  endpoints.forEach((ep, i) => {
    const clean = ep.endpoint.replace(/^https?:\/\/[^/]+/, '') || '/';
    const fn = clean.replace(/[^a-zA-Z0-9_]/g, '_').replace(/^_+/, '') || 'root_' + i;
    codeLines.push('', '@app.' + ep.method.toLowerCase() + '("' + clean + '")');
    codeLines.push('async def handle_' + fn + '(payload: Optional[ReconstructedPayload] = None, authorization: Optional[str] = Header(None)):');
    codeLines.push('    if not authorization:');
    codeLines.push('        raise HTTPException(status_code=401, detail="Missing Auth")');
    codeLines.push('    return {"status": "RECONSTRUCTED_OK"}');
  });

  // OpenAPI
  const openapiPaths = {};
  endpoints.forEach(e => { openapiPaths[e.endpoint] = { [e.method.toLowerCase()]: { summary: 'Extracted', responses: { '200': { description: 'OK' } } } }; });

  // Weaknesses
  const weaknesses = [];
  if (secrets.length) weaknesses.push('[CRITICAL] ' + secrets.length + ' Hardcoded Secret(s): ' + secrets.slice(0, 3).join(', '));
  if (/eval\s*\(/.test(content)) weaknesses.push('[HIGH] Penggunaan eval() — risiko XSS/injection.');
  if (paths.some(p => /admin|internal/.test(p))) weaknesses.push('[MEDIUM] Laluan /admin atau /internal terdedah.');
  if (!weaknesses.length) weaknesses.push('[INFO] Tiada kebocoran kritikal dikesan.');

  const stack = [];
  if (/webpackChunk|__webpack_require__/.test(content)) stack.push('Bundler: Webpack');
  if (/fetch\(|axios/.test(content)) stack.push('Client: REST/AJAX');
  if (/Bearer |jwt/.test(content)) stack.push('Auth: JWT');

  return {
    execution_time_ms: Date.now() - t0,
    detected_stack: stack.length ? stack : ['Raw / Obfuscated'],
    extracted_endpoints: endpoints,
    extracted_secrets_or_keys: secrets,
    inferred_db_schema: sqlLines.join('\n'),
    decompiled_clean_code: codeLines.join('\n'),
    openapi_spec: { openapi: '3.0.3', info: { title: 'Recon API', version: '1.0.0' }, paths: openapiPaths },
    security_weaknesses: weaknesses
  };
}

export function renderReconUI() {
  return `<!DOCTYPE html>
<html lang="ms" class="dark"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>NEXUS RECON-X</title>
<script src="https://cdn.tailwindcss.com"><\/script><script>tailwind.config={darkMode:'class'}<\/script>
</head><body class="bg-slate-950 text-slate-200 font-mono min-h-screen p-6">
<div class="max-w-6xl mx-auto">
<header class="border-b border-slate-800 pb-4 mb-6 flex items-center justify-between flex-wrap gap-3">
<div class="flex items-center gap-3"><div class="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
<h1 class="text-lg font-bold text-white">NEXUS<span class="text-emerald-400">RECON-X</span> // JS Engine</h1>
<span class="text-xs px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400">SUB-MS</span></div>
<div class="flex gap-4 text-xs"><div>Speed: <span id="speed" class="text-emerald-400 font-bold">0 ms</span></div>
<div>EPs: <span id="eps" class="text-cyan-400 font-bold">0</span></div></div></header>
<div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
<div class="bg-slate-900 border border-slate-800 rounded-xl p-4">
<textarea id="payload" rows="14" class="w-full bg-slate-950 border border-slate-700 rounded p-3 text-xs text-emerald-300 font-mono focus:outline-none focus:border-emerald-500" placeholder="Paste obfuscated JS, cURL, HAR, atau API code..."></textarea>
<div class="flex gap-2 mt-3">
<button onclick="runRecon()" class="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded text-xs">RECON</button>
<button onclick="loadSample()" class="px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-xs">Sample</button>
</div>
<div id="weak" class="mt-3 text-xs space-y-1 max-h-32 overflow-y-auto"></div>
</div>
<div class="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-4">
<div class="flex gap-2 mb-3 border-b border-slate-800 pb-2">
<button onclick="tab('ep')" id="t-ep" class="text-xs px-3 py-1.5 rounded bg-emerald-600 text-white font-bold">ENDPOINTS</button>
<button onclick="tab('code')" id="t-code" class="text-xs px-3 py-1.5 rounded bg-slate-950 text-slate-400">CODE</button>
<button onclick="tab('sql')" id="t-sql" class="text-xs px-3 py-1.5 rounded bg-slate-950 text-slate-400">SQL</button>
<button onclick="tab('oapi')" id="t-oapi" class="text-xs px-3 py-1.5 rounded bg-slate-950 text-slate-400">OPENAPI</button>
</div>
<div class="bg-slate-950 border border-slate-800 rounded p-3 text-xs h-[480px] overflow-y-auto">
<div id="o-ep" class="space-y-2 text-slate-300">// Paste payload dan klik RECON</div>
<pre id="o-code" class="hidden text-emerald-400 whitespace-pre-wrap"></pre>
<pre id="o-sql" class="hidden text-cyan-300 whitespace-pre-wrap"></pre>
<pre id="o-oapi" class="hidden text-amber-300 whitespace-pre-wrap"></pre>
</div></div></div></div>
<script>
let active='ep';
function tab(t){['ep','code','sql','oapi'].forEach(x=>{document.getElementById('o-'+x).classList.add('hidden');document.getElementById('t-'+x).className='text-xs px-3 py-1.5 rounded bg-slate-950 text-slate-400'});document.getElementById('o-'+t).classList.remove('hidden');document.getElementById('t-'+t).className='text-xs px-3 py-1.5 rounded bg-emerald-600 text-white font-bold';active=t;}
function loadSample(){document.getElementById('payload').value='const cfg={apiKey:"sk_live_998877665544332211aabb"};fetch("/api/v2/auth/login",{method:"POST",body:JSON.stringify({email:u,password_hash:p,role:"admin"})});axios.post("/api/v2/payment/transfer",{user_id:uid,amount:amt});';}
async function runRecon(){
const p=document.getElementById('payload').value.trim();if(!p)return alert('paste payload');
const r=await fetch('/api/recon',{method:'POST',headers:{'Content-Type':'application/json','X-API-Key':localStorage.getItem('argon_key')||''},body:JSON.stringify({target_type:'CODE_SNIPPET',payload:p})});
const d=await r.json();
document.getElementById('speed').innerText=d.execution_time_ms+' ms';
document.getElementById('eps').innerText=d.extracted_endpoints.length;
document.getElementById('weak').innerHTML=d.security_weaknesses.map(w=>'<div class="'+(w.includes('CRITICAL')?'text-rose-400 font-bold':'text-amber-400')+'">'+w+'</div>').join('');
document.getElementById('o-ep').innerHTML=d.extracted_endpoints.map(e=>'<div class="p-2 bg-slate-900 border border-slate-800 rounded"><span class="px-2 py-0.5 text-xs rounded '+(e.method==='GET'?'bg-cyan-500/20 text-cyan-400':'bg-emerald-500/20 text-emerald-400')+'">'+e.method+'</span> <span class="text-white font-bold">'+e.endpoint+'</span></div>').join('');
document.getElementById('o-code').innerText=d.decompiled_clean_code;
document.getElementById('o-sql').innerText=d.inferred_db_schema;
document.getElementById('o-oapi').innerText=JSON.stringify(d.openapi_spec,null,2);
}
<\/script></body></html>`;
}
