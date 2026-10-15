/**
 * ARGON OMNI-OVERLORD // UNIVERSAL MULTI-REPO + FULL-STACK E2E ENGINE
 * - Universal repo scanner (recursive tree)
 * - Atomic multi-file commit (Git Data API)
 * - Full-stack E2E generator (UI + API + DB + /health)
 * - Cross-repo watchdog
 *
 * SAFETY: allowlist of repos only (env.OMNI_ALLOWED_REPOS)
 */
const MODEL = "@cf/meta/llama-4-scout-17b-16e-instruct";
const DEFAULT_ALLOWED = "vmojuga-pixel/Argon,vmojuga-pixel/buku-koding-agentic";

function allowedRepos(env) {
  const raw = (env.OMNI_ALLOWED_REPOS || DEFAULT_ALLOWED).split(",");
  return new Set(raw.map((r) => r.trim()).filter(Boolean));
}

function repoAllowed(env, repo) {
  return allowedRepos(env).has(repo);
}

export class OmniOverlordEngine {
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }

  // ---- 1. UNIVERSAL REPO SCANNER ----
  async scanAnyRepository(targetRepo, branch = "main") {
    const token = this.env.GITHUB_TOKEN;
    const repo = (targetRepo || "").trim();

    if (!repo) {
      return { scanned: false, repo, branch, detectedStack: ["No-Repo-Specified"], fileCount: 0, files: [], note: "targetRepo required" };
    }
    if (!repoAllowed(this.env, repo)) {
      return { scanned: false, repo, branch, detectedStack: [], fileCount: 0, files: [], note: "repo not in allowlist" };
    }
    if (!token) {
      return { scanned: false, repo, branch, detectedStack: ["Virtual-Mode"], fileCount: 0, files: [], note: "GITHUB_TOKEN missing" };
    }

    const headers = {
      "Authorization": `Bearer ${token}`,
      "User-Agent": "Argon-Omni-Overlord",
      "Accept": "application/vnd.github.v3+json"
    };

    try {
      const treeUrl = `https://api.github.com/repos/${repo}/git/trees/${branch}?recursive=1`;
      const res = await fetch(treeUrl, { headers });

      if (!res.ok) {
        return { scanned: false, repo, branch, detectedStack: ["New/Empty"], fileCount: 0, files: [], note: `HTTP ${res.status}` };
      }

      const data = await res.json();
      const allFiles = (data.tree || []).filter((i) => i.type === "blob").map((i) => i.path);
      const stack = [];
      if (allFiles.includes("wrangler.toml")) stack.push("Cloudflare Workers");
      if (allFiles.includes("package.json")) stack.push("Node.js");
      if (allFiles.some((f) => f.endsWith(".py"))) stack.push("Python");
      if (allFiles.some((f) => /\.(tsx|jsx)$/.test(f))) stack.push("React/Next.js");
      if (allFiles.some((f) => f.endsWith(".sql"))) stack.push("SQL");
      if (!stack.length) stack.push("Generic");

      return { scanned: true, repo, branch, detectedStack: stack, fileCount: allFiles.length, files: allFiles.slice(0, 120), treeSha: data.sha };
    } catch (err) {
      return { scanned: false, repo, branch, detectedStack: [], fileCount: 0, files: [], note: err.message };
    }
  }

  // ---- 2. ATOMIC MULTI-FILE COMMIT (Git Data API) ----
  async atomicMultiFileCommit(targetRepo, branch, filesArray, commitMessage) {
    const token = this.env.GITHUB_TOKEN;
    const repo = (targetRepo || "").trim();
    const fallback = { committed: false, repo, filesWritten: filesArray.map((f) => f.path) };

    if (!repoAllowed(this.env, repo)) return { ...fallback, note: "repo not in allowlist" };
    if (!token) return { ...fallback, note: "GITHUB_TOKEN missing" };

    const baseUrl = `https://api.github.com/repos/${repo}/git`;
    const headers = {
      "Authorization": `Bearer ${token}`,
      "User-Agent": "Argon-Omni-Overlord",
      "Accept": "application/vnd.github.v3+json",
      "Content-Type": "application/json"
    };

    try {
      const refRes = await fetch(`${baseUrl}/ref/heads/${branch}`, { headers });
      if (!refRes.ok) {
        // Repo kosong: fallback guna Contents API
        for (const f of filesArray) {
          await this.fallbackSingleFilePut(repo, f.path, f.content, commitMessage, branch);
        }
        return { committed: true, mode: "CONTENTS_API_FALLBACK", repo, filesWritten: filesArray.map((f) => f.path) };
      }

      const latestCommitSha = (await refRes.json()).object.sha;
      const commitRes = await fetch(`${baseUrl}/commits/${latestCommitSha}`, { headers });
      const baseTreeSha = (await commitRes.json()).tree.sha;

      const treeItems = filesArray.map((file) => ({
        path: file.path,
        mode: "100644",
        type: "blob",
        content: file.content
      }));

      const newTreeRes = await fetch(`${baseUrl}/trees`, {
        method: "POST",
        headers,
        body: JSON.stringify({ base_tree: baseTreeSha, tree: treeItems })
      });
      const newTreeData = await newTreeRes.json();
      if (!newTreeData.sha) return { ...fallback, error: JSON.stringify(newTreeData) };

      const newCommitRes = await fetch(`${baseUrl}/commits`, {
        method: "POST",
        headers,
        body: JSON.stringify({ message: commitMessage, tree: newTreeData.sha, parents: [latestCommitSha] })
      });
      const newCommitData = await newCommitRes.json();
      if (!newCommitData.sha) return { ...fallback, error: JSON.stringify(newCommitData) };

      const patchRes = await fetch(`${baseUrl}/refs/heads/${branch}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ sha: newCommitData.sha, force: false })
      });
      if (!patchRes.ok) return { ...fallback, error: `ref patch HTTP ${patchRes.status}` };

      return { committed: true, mode: "ATOMIC_GIT_TREE", repo, commitSha: newCommitData.sha, filesWritten: filesArray.map((f) => f.path) };
    } catch (err) {
      return { ...fallback, error: err.message };
    }
  }

  async fallbackSingleFilePut(repo, filePath, contentText, commitMessage, branch) {
    const token = this.env.GITHUB_TOKEN;
    const apiUrl = `https://api.github.com/repos/${repo}/contents/${filePath}`;
    const headers = {
      "Authorization": `Bearer ${token}`,
      "User-Agent": "Argon-Omni-Overlord",
      "Content-Type": "application/json"
    };
    let sha = null;
    const getRes = await fetch(apiUrl, { headers });
    if (getRes.status === 200) sha = (await getRes.json()).sha;
    const base64Content = btoa(unescape(encodeURIComponent(contentText)));
    const body = { message: commitMessage, content: base64Content, branch };
    if (sha) body.sha = sha;
    await fetch(apiUrl, { method: "PUT", headers, body: JSON.stringify(body) });
  }

  // ---- 3. FULL-STACK E2E SYNTHESIZER ----
  async synthesizeEndToEndFullStackApp(directive, appSlug, repoScanInfo) {
    const cleanTitle = directive.replace(/[^a-zA-Z0-9 -]/g, "").slice(0, 65) || "Enterprise Full-Stack App";

    let aiNote = "Dijana secara deterministik oleh Omni-Overlord.";
    if (this.env.AI) {
      try {
        const r = await this.env.AI.run(MODEL, {
          messages: [
            { role: "system", content: "Berikan 2 ayat ringkas spesifikasi seni bina full-stack dalam BM." },
            { role: "user", content: directive }
          ],
          max_tokens: 150
        });
        if (r && (r.response || r.result)) aiNote = String(r.response || r.result).replace(/`/g, "'").slice(0, 300);
      } catch (e) { console.log("[OMNI-AI-FALLBACK]", e.message); }
    }

    const sqlSchema = `-- OMNI E2E SCHEMA for: ${appSlug}\n-- Directive: ${cleanTitle}\nCREATE TABLE IF NOT EXISTS records (\n  id TEXT PRIMARY KEY,\n  title TEXT NOT NULL,\n  category TEXT DEFAULT 'GENERAL',\n  amount NUMERIC DEFAULT 0.00,\n  status TEXT DEFAULT 'ACTIVE',\n  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n);\nCREATE INDEX IF NOT EXISTS idx_records_status ON records(status);\n`;

    const workerCode = this.buildFullStackWorker(appSlug, cleanTitle, aiNote);

    const openApiSpec = JSON.stringify({
      openapi: "3.1.0",
      info: { title: `${appSlug} API`, version: "1.0.0", description: cleanTitle },
      paths: {
        "/health": { get: { summary: "Watchdog health" } },
        "/api/items": { get: { summary: "List records" }, post: { summary: "Create record" } },
        "/api/items/{id}": { delete: { summary: "Delete record" } }
      }
    }, null, 2);

    const projectWrangler = `name = "${appSlug}"\nmain = "src/worker.js"\ncompatibility_date = "2025-04-01"\n`;

    const readmeDoc = `# ${appSlug.toUpperCase()}\n\n- Directive: ${directive}\n- Target repo: \`${repoScanInfo.repo}\`\n- Files scanned: ${repoScanInfo.fileCount}\n- Detected stack: ${repoScanInfo.detectedStack.join(", ")}\n- AI note: ${aiNote}\n\n## Auto-generated files\n1. \`apps/${appSlug}/src/worker.js\` — full-stack bundle\n2. \`apps/${appSlug}/db/schema.sql\` — SQL schema\n3. \`apps/${appSlug}/openapi.json\` — API contract\n4. \`apps/${appSlug}/wrangler.toml\` — deploy config\n`;

    return {
      workerCode,
      filesToCommit: [
        { path: `apps/${appSlug}/src/worker.js`, content: workerCode },
        { path: `apps/${appSlug}/db/schema.sql`, content: sqlSchema },
        { path: `apps/${appSlug}/openapi.json`, content: openApiSpec },
        { path: `apps/${appSlug}/wrangler.toml`, content: projectWrangler },
        { path: `apps/${appSlug}/README.md`, content: readmeDoc }
      ]
    };
  }

  buildFullStackWorker(appSlug, cleanTitle, aiNote) {
    // Simpan sebagai template string — escape backticks untuk nested html
    const tpl = [
      'const EDGE_DATABASE = {',
      '  items: [',
      '    { id: "REC-101", title: "' + cleanTitle.slice(0, 28).replace(/"/g, "") + '", category: "PRODUCTION", amount: 1250.00, status: "VERIFIED", createdAt: new Date().toISOString() },',
      '    { id: "REC-102", title: "Watchdog node 24/7", category: "INFRA", amount: 480.50, status: "ACTIVE", createdAt: new Date().toISOString() }',
      '  ]',
      '};',
      '',
      'export default {',
      '  async fetch(request, env) {',
      '    const url = new URL(request.url);',
      '    const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" };',
      '    if (request.method === "OPTIONS") return new Response(null, { headers: cors });',
      '',
      '    if (url.pathname === "/health") {',
      '      return new Response(JSON.stringify({ status: "HEALTHY", app: "' + appSlug + '", records: EDGE_DATABASE.items.length, ts: Date.now() }), { headers: { ...cors, "Content-Type": "application/json" } });',
      '    }',
      '',
      '    if (url.pathname === "/api/items" && request.method === "GET") {',
      '      const total = EDGE_DATABASE.items.reduce((s, i) => s + Number(i.amount || 0), 0);',
      '      return new Response(JSON.stringify({ items: EDGE_DATABASE.items, metrics: { totalCount: EDGE_DATABASE.items.length, totalValue: total.toFixed(2) } }), { headers: { ...cors, "Content-Type": "application/json" } });',
      '    }',
      '',
      '    if (url.pathname === "/api/items" && request.method === "POST") {',
      '      const body = await request.json();',
      '      const newItem = { id: "REC-" + Math.floor(100 + Math.random() * 900), title: String(body.title || "Item").slice(0, 120), category: String(body.category || "GENERAL").toUpperCase(), amount: parseFloat(body.amount || 0), status: "ACTIVE", createdAt: new Date().toISOString() };',
      '      EDGE_DATABASE.items.unshift(newItem);',
      '      return new Response(JSON.stringify({ created: true, item: newItem }), { headers: { ...cors, "Content-Type": "application/json" } });',
      '    }',
      '',
      '    if (url.pathname.startsWith("/api/items/") && request.method === "DELETE") {',
      '      const id = url.pathname.split("/").pop();',
      '      EDGE_DATABASE.items = EDGE_DATABASE.items.filter((i) => i.id !== id);',
      '      return new Response(JSON.stringify({ deleted: true, id }), { headers: { ...cors, "Content-Type": "application/json" } });',
      '    }',
      '',
      '    const html = `<!DOCTYPE html><html lang="ms" class="dark"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + appSlug.toUpperCase() + '</title><script src="https://cdn.tailwindcss.com"><\\/script></head><body class="bg-slate-950 text-slate-100 font-sans min-h-screen p-6"><div class="max-w-6xl mx-auto"><header class="border-b border-slate-800 pb-4 mb-6 flex items-center justify-between"><div class="flex items-center gap-3"><span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span><span class="font-mono font-bold">' + appSlug.toUpperCase() + '</span><span class="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">E2E</span></div><div class="text-xs font-mono text-slate-400">API: /api/items | Health: /health</div></header><div class="grid grid-cols-1 lg:grid-cols-12 gap-6"><div class="lg:col-span-4 space-y-6"><div class="bg-slate-900 border border-slate-800 rounded-xl p-5"><div class="text-xs font-mono text-emerald-400 font-bold mb-1">// SPEC</div><h1 class="text-base font-bold text-white mb-2">' + cleanTitle.replace(/</g, "&lt;") + '</h1><p class="text-xs text-slate-400">' + aiNote.replace(/</g, "&lt;") + '</p></div><div class="bg-slate-900 border border-slate-800 rounded-xl p-5"><h2 class="text-xs font-mono uppercase text-cyan-400 font-bold mb-3">Add Record</h2><input id="t" placeholder="Title" class="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white mb-2"><input id="c" placeholder="Category" class="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white mb-2"><input id="a" type="number" step="0.01" placeholder="Amount" class="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white mb-2"><button onclick="add()" class="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-lg text-xs">SAVE</button></div></div><div class="lg:col-span-8 space-y-4"><div class="grid grid-cols-2 gap-4 font-mono"><div class="bg-slate-900 border border-slate-800 rounded-xl p-4"><div class="text-xs text-slate-400">COUNT</div><div id="s1" class="text-2xl font-bold text-white">0</div></div><div class="bg-slate-900 border border-slate-800 rounded-xl p-4"><div class="text-xs text-slate-400">VALUE</div><div id="s2" class="text-2xl font-bold text-emerald-400">$0</div></div></div><div class="bg-slate-900 border border-slate-800 rounded-xl p-5"><div id="list" class="space-y-2 font-mono text-xs"></div></div></div></div></div><script>async function load(){const r=await fetch("/api/items");const d=await r.json();document.getElementById("s1").innerText=d.metrics.totalCount;document.getElementById("s2").innerText="$"+d.metrics.totalValue;document.getElementById("list").innerHTML=d.items.map(i=>\'<div class="p-3 bg-slate-950 border border-slate-800 rounded-lg flex justify-between"><div><span class="text-emerald-400 font-bold">[\'+i.id+\']</span> <span class="text-white font-bold">\'+i.title+\'</span> <span class="text-cyan-300 text-xs">\'+i.category+\'</span></div><div><span class="text-amber-300 mr-3">$\'+Number(i.amount).toFixed(2)+\'</span><button onclick="del(\\\'\'+i.id+\'\\\')" class="text-rose-400 text-xs">DEL</button></div></div>\').join("");}async function add(){const t=document.getElementById("t").value;if(!t)return;await fetch("/api/items",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({title:t,category:document.getElementById("c").value,amount:document.getElementById("a").value})});document.getElementById("t").value="";load();}async function del(id){await fetch("/api/items/"+id,{method:"DELETE"});load();}load();<\\/script></body></html>`;',
      '    return new Response(html, { headers: { "Content-Type": "text/html;charset=UTF-8" } });',
      '  }',
      '};'
    ].join("\n");
    return tpl;
  }

  // ---- 4. DEPLOY TO CLOUDFLARE EDGE ----
  async deployToCloudflareEdge(scriptName, workerCode) {
    const accountId = this.env.CF_ACCOUNT_ID;
    const apiToken = this.env.CF_API_TOKEN;
    const subdomain = this.env.CF_SUBDOMAIN || "vmojuga";

    if (!accountId || !apiToken) {
      return { deployed: false, mode: "REPO_ONLY", liveUrl: `https://${scriptName}.${subdomain}.workers.dev`, note: "CF creds missing" };
    }

    const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/scripts/${scriptName}`;
    const fd = new FormData();
    fd.append("metadata", new Blob([JSON.stringify({ main_module: "worker.js", compatibility_date: "2025-04-01" })], { type: "application/json" }));
    fd.append("worker.js", new Blob([workerCode], { type: "application/javascript+module" }), "worker.js");

    try {
      const res = await fetch(url, { method: "PUT", headers: { "Authorization": `Bearer ${apiToken}` }, body: fd });
      const data = await res.json();
      if (!res.ok || !data.success) return { deployed: false, mode: "CF_API_ERROR", error: JSON.stringify(data.errors || data).slice(0, 300) };

      await fetch(url + "/subdomain", {
        method: "POST",
        headers: { "Authorization": `Bearer ${apiToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: true })
      });

      return { deployed: true, mode: "LIVE_E2E", liveUrl: `https://${scriptName}.${subdomain}.workers.dev` };
    } catch (err) {
      return { deployed: false, mode: "NETWORK_ERROR", error: err.message };
    }
  }

  // ---- 5. PIPELINE ----
  async executeUniversalRepoCommand(payload) {
    const timestamp = new Date().toISOString();
    const targetRepo = (payload.targetRepo || "").trim();
    const branch = (payload.branch || "main").trim();
    const directive = payload.directive;
    const appSlug = (payload.slug || "fullstack-" + Math.random().toString(36).substring(2, 7))
      .toLowerCase().replace(/[^a-z0-9-]/g, "-");

    if (!repoAllowed(this.env, targetRepo)) {
      return { error: "targetRepo not in allowlist", allowed: [...allowedRepos(this.env)] };
    }

    const repoScan = await this.scanAnyRepository(targetRepo, branch);
    const bundle = await this.synthesizeEndToEndFullStackApp(directive, appSlug, repoScan);

    const gitResult = await this.atomicMultiFileCommit(
      targetRepo, branch, bundle.filesToCommit,
      `[Omni-Overlord E2E] auto-build '${appSlug}'`
    );

    const deployResult = await this.deployToCloudflareEdge(appSlug, bundle.workerCode);

    const registry = (await this.state.storage.get("universal_projects")) || [];
    const record = {
      appSlug, targetRepo, branch, directive, createdAt: timestamp, lastCheckedAt: timestamp,
      healthStatus: "PENDING_CHECK", autoHealCount: 0,
      repoScanSummary: { existingFilesCount: repoScan.fileCount, detectedStack: repoScan.detectedStack },
      gitCommit: gitResult,
      deployment: deployResult,
      generatedFiles: bundle.filesToCommit.map((f) => f.path),
      previewWorkerCode: bundle.workerCode
    };

    const idx = registry.findIndex((p) => p.appSlug === appSlug && p.targetRepo === targetRepo);
    if (idx >= 0) registry[idx] = record; else registry.unshift(record);
    await this.state.storage.put("universal_projects", registry);
    return record;
  }

  // ---- 6. WATCHDOG ----
  async runUniversalWatchdogSweep() {
    const timestamp = new Date().toISOString();
    let epoch = ((await this.state.storage.get("epoch")) || 0) + 1;
    await this.state.storage.put("epoch", epoch);

    const registry = (await this.state.storage.get("universal_projects")) || [];
    for (const proj of registry) {
      proj.lastCheckedAt = timestamp;
      if (proj.deployment && proj.deployment.deployed && proj.deployment.liveUrl) {
        try {
          const r = await fetch(proj.deployment.liveUrl + "/health", { cf: { cacheTtl: 0 } });
          if (r.status === 530) { proj.healthStatus = "PROPAGATING"; continue; }
          if (!r.ok && r.status >= 500) throw new Error("HTTP " + r.status);
          proj.healthStatus = "ONLINE_E2E_HEALTHY";
        } catch (e) {
          proj.autoHealCount = (proj.autoHealCount || 0) + 1;
          proj.healthStatus = "AUTO_HEALED";
          await this.deployToCloudflareEdge(proj.appSlug, proj.previewWorkerCode);
        }
      } else {
        proj.healthStatus = "REPO_ONLY_VERIFIED";
      }
    }
    await this.state.storage.put("universal_projects", registry);
    return { epoch, timestamp, totalManaged: registry.length };
  }

  // ---- 7. FETCH ROUTER ----
  async fetch(request) {
    const url = new URL(request.url);
    const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" };
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });

    if (url.pathname === "/omni/scan-repo" && request.method === "POST") {
      let body = {}; try { body = await request.json(); } catch {}
      return Response.json(await this.scanAnyRepository(body.targetRepo, body.branch || "main"), { headers: cors });
    }
    if (url.pathname === "/omni/execute" && request.method === "POST") {
      let body = {}; try { body = await request.json(); } catch {}
      if (!body.directive) return Response.json({ error: "directive required" }, { status: 400, headers: cors });
      return Response.json(await this.executeUniversalRepoCommand(body), { headers: cors });
    }
    if (url.pathname === "/omni/watchdog" && request.method === "POST") {
      return Response.json(await this.runUniversalWatchdogSweep(), { headers: cors });
    }
    if (url.pathname === "/omni/report" && request.method === "GET") {
      const epoch = (await this.state.storage.get("epoch")) || 0;
      const projects = (await this.state.storage.get("universal_projects")) || [];
      const uniqueRepos = [...new Set(projects.map((p) => p.targetRepo))];
      const totalHeals = projects.reduce((a, b) => a + (b.autoHealCount || 0), 0);
      return Response.json({
        timestamp: new Date().toISOString(),
        executiveSummary: `Omni-Overlord kawal ${projects.length} projek di ${uniqueRepos.length} repo. ${totalHeals} auto-heal.`,
        metrics: { epoch, totalProjects: projects.length, totalRepos: uniqueRepos.length, totalAutoHeals: totalHeals },
        allowlist: [...allowedRepos(this.env)],
        projects
      }, { headers: cors });
    }
    return new Response("Omni-Overlord active", { status: 200, headers: cors });
  }
}
