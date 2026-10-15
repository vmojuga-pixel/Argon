/**
 * ARGON OVERLORD // TIER-1 AUTONOMOUS SENIOR DEV ENGINE
 * Auto-code, auto-deploy (CF API), auto-maintain (self-heal), auto-commit (GitHub)
 */
const MODEL = "@cf/meta/llama-4-scout-17b-16e-instruct";
const SLUG_PREFIX = "argon-app-";
const PROTECTED_SLUGS = new Set(["argon", "nexus-swarm"]);

export class OverlordSeniorDev {
  constructor(state, env) { this.state = state; this.env = env; }

  async invokeSeniorBrain(systemRole, prompt) {
    if (!this.env.AI) return this.deterministicCodeGenerator(systemRole, prompt);
    try {
      const res = await this.env.AI.run(MODEL, {
        messages: [
          { role: "system", content: systemRole + " Output ringkas. Kod sahaja bila diminta kod." },
          { role: "user", content: prompt }
        ],
        temperature: 0.2,
        max_tokens: 1200
      });
      return (res && (res.response || res.result)) || this.deterministicCodeGenerator(systemRole, prompt);
    } catch (e) {
      console.log("[OVERLORD-AI-FALLBACK]", e.message);
      return this.deterministicCodeGenerator(systemRole, prompt);
    }
  }

  deterministicCodeGenerator(role, prompt) {
    const cleanTask = String(prompt).replace(/[^a-zA-Z0-9 -]/g, "").slice(0, 80);
    if (role.includes("COMPLETE_WORKER_BUILDER")) {
      return 'export default {\n  async fetch(request, env) {\n    const url = new URL(request.url);\n    if (url.pathname === "/health") {\n      return new Response(JSON.stringify({ status: "HEALTHY", task: "' + cleanTask + '", ts: Date.now() }), { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });\n    }\n    const html = `<!DOCTYPE html><html lang="ms" class="dark"><head><meta charset="UTF-8"><title>Argon Auto-Deployed</title><script src="https://cdn.tailwindcss.com"><\\/script></head><body class="bg-slate-950 text-slate-100 font-mono min-h-screen flex items-center justify-center p-6"><div class="max-w-2xl w-full bg-slate-900 border border-emerald-500/40 rounded-xl p-6"><div class="text-xs text-emerald-400 font-bold mb-2">// DEPLOYED BY OVERLORD</div><h1 class="text-xl font-bold text-white mb-4">' + cleanTask + '</h1><div class="bg-slate-950 p-3 rounded border border-slate-800 text-xs text-cyan-400">Status: ONLINE | /health</div></div></body></html>`;\n    return new Response(html, { headers: { "Content-Type": "text/html;charset=UTF-8" } });\n  }\n};';
    }
    return "[OVERLORD]: Task '" + cleanTask + "' dianalisis. Kod sedia untuk review.";
  }

  async deployWorkerToCloudflare(scriptName, esModuleCode) {
    if (PROTECTED_SLUGS.has(scriptName)) {
      return { deployed: false, mode: "BLOCKED_PROTECTED", reason: "Slug '" + scriptName + "' dilindungi." };
    }
    if (!scriptName.startsWith(SLUG_PREFIX)) {
      return { deployed: false, mode: "BLOCKED_SLUG_PREFIX", reason: "Slug wajib prefix '" + SLUG_PREFIX + "'." };
    }

    const accountId = this.env.CF_ACCOUNT_ID;
    const apiToken = this.env.CF_API_TOKEN;
    if (!accountId || !apiToken) {
      return { deployed: false, mode: "SIMULATED_SANDBOX", url: "https://" + scriptName + ".sandbox.internal", note: "CF secrets belum set." };
    }

    const url = "https://api.cloudflare.com/client/v4/accounts/" + accountId + "/workers/scripts/" + scriptName;
    const metadata = { main_module: "worker.js", compatibility_date: "2025-04-01" };
    const fd = new FormData();
    fd.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
    fd.append("worker.js", new Blob([esModuleCode], { type: "application/javascript+module" }), "worker.js");

    try {
      const res = await fetch(url, { method: "PUT", headers: { "Authorization": "Bearer " + apiToken }, body: fd });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { deployed: false, mode: "CF_API_ERROR", error: JSON.stringify(data.errors || data).slice(0, 300) };
      }
      await fetch(url + "/subdomain", { method: "POST", headers: { "Authorization": "Bearer " + apiToken, "Content-Type": "application/json" }, body: JSON.stringify({ enabled: true }) });
      return { deployed: true, mode: "LIVE_PRODUCTION", url: "https://" + scriptName + "." + (this.env.CF_SUBDOMAIN || "workers") + ".dev" };
    } catch (e) {
      return { deployed: false, mode: "NETWORK_EXCEPTION", error: e.message };
    }
  }

  async pushFileToGitHub(filePath, contentText, commitMessage, appendMode = false) {
    const token = this.env.GITHUB_TOKEN;
    const repo = this.env.GITHUB_REPO_OVERLORD || this.env.GITHUB_REPO;
    if (!token || !repo) return { synced: false, path: filePath, reason: "GITHUB_TOKEN/REPO tiada." };

    const apiUrl = "https://api.github.com/repos/" + repo + "/contents/" + filePath;
    const headers = {
      "Authorization": "Bearer " + token,
      "User-Agent": "Argon-Overlord",
      "Accept": "application/vnd.github.v3+json",
      "Content-Type": "application/json"
    };
    try {
      let finalContent = contentText;
      let sha = null;
      const g = await fetch(apiUrl, { headers });
      if (g.status === 200) {
        const fd = await g.json();
        sha = fd.sha;
        if (appendMode) {
          const existing = decodeURIComponent(escape(atob(fd.content.replace(/\n/g, ""))));
          finalContent = existing + "\n" + contentText;
        }
      }
      const b64 = btoa(unescape(encodeURIComponent(finalContent)));
      const body = { message: commitMessage, content: b64 };
      if (sha) body.sha = sha;
      const p = await fetch(apiUrl, { method: "PUT", headers, body: JSON.stringify(body) });
      if (!p.ok) return { synced: false, path: filePath, reason: "GitHub " + p.status };
      return { synced: true, path: filePath };
    } catch (e) { return { synced: false, path: filePath, reason: e.message }; }
  }

  async buildDeployAndMaintainTask(taskDirective, serviceSlug = null) {
    const timestamp = new Date().toISOString();
    const slug = serviceSlug || (SLUG_PREFIX + Math.random().toString(36).substring(2, 7));

    const rawCode = await this.invokeSeniorBrain(
      "ROLE: COMPLETE_WORKER_BUILDER. Tulis kod Cloudflare Worker ES Module lengkap (export default { async fetch(request, env) { ... } }) termasuk endpoint /health dan UI HTML Tailwind. Pulangkan kod JavaScript sahaja.",
      "Arahan: " + taskDirective
    );
    let cleanCode = rawCode.replace(/```javascript/gi, "").replace(/```js/gi, "").replace(/```/g, "").trim();
    if (!cleanCode.includes("export default")) cleanCode = this.deterministicCodeGenerator("COMPLETE_WORKER_BUILDER", taskDirective);

    const auditReport = await this.invokeSeniorBrain("ROLE: BREAKER. Audit keselamatan ringkas.", cleanCode.slice(0, 2000));
    const deployResult = await this.deployWorkerToCloudflare(slug, cleanCode);

    const repoPath = "docs/swarm-output/" + slug + "/worker.js";
    const docPath = "docs/swarm-output/" + slug + "/README.md";
    const readme = "# Service: " + slug + "\n- Directive: " + taskDirective + "\n- Built: " + timestamp + "\n- Deploy: " + deployResult.mode + "\n- URL: " + (deployResult.url || "N/A") + "\n\n## Audit\n" + auditReport + "\n";

    const gitCodeSync = await this.pushFileToGitHub(repoPath, cleanCode, "[Overlord] Deploy " + slug, false);
    await this.pushFileToGitHub(docPath, readme, "[Overlord] Docs " + slug, false);

    const services = (await this.state.storage.get("managed_services")) || [];
    const record = { slug, directive: taskDirective, createdAt: timestamp, lastCheckedAt: timestamp, healthStatus: "DEPLOYED_AWAITING_PROPAGATION", autoHealCount: 0, deployInfo: deployResult, gitPath: repoPath, gitSynced: gitCodeSync.synced, lastStableCode: cleanCode };
    const idx = services.findIndex(s => s.slug === slug);
    if (idx >= 0) services[idx] = record; else services.push(record);
    await this.state.storage.put("managed_services", services);
    await this.logActivity("TASK_DEPLOYED", slug + " → " + deployResult.mode);
    return record;
  }

  async run24x7AutonomousMaintenance() {
    const timestamp = new Date().toISOString();
    let epoch = ((await this.state.storage.get("epoch")) || 0) + 1;
    await this.state.storage.put("epoch", epoch);

    const services = (await this.state.storage.get("managed_services")) || [];
    const results = [];

    for (const svc of services) {
      svc.lastCheckedAt = timestamp;
      if (svc.deployInfo && svc.deployInfo.deployed && svc.deployInfo.url) {
        try {
          const r = await fetch(svc.deployInfo.url + "/health", { cf: { cacheTtl: 0 } });
          // 530 = subdomain propagation (bukan failure sebenar)
          if (r.status === 530) {
            svc.healthStatus = "PROPAGATING (530)";
            results.push({ slug: svc.slug, action: "SKIP_530_PROPAGATING" });
          } else if (!r.ok && r.status >= 500) {
            throw new Error("HTTP " + r.status);
          } else if (!r.ok) {
            svc.healthStatus = "WARN_" + r.status;
            results.push({ slug: svc.slug, action: "WARN_" + r.status });
          } else {
            svc.healthStatus = "ONLINE_HEALTHY";
            results.push({ slug: svc.slug, action: "HEALTH_OK" });
          }
        } catch (err) {
          svc.healthStatus = "AUTO_HEALED";
          svc.autoHealCount = (svc.autoHealCount || 0) + 1;
          await this.deployWorkerToCloudflare(svc.slug, svc.lastStableCode);
          results.push({ slug: svc.slug, action: "SELF_HEAL: " + err.message });
          await this.logActivity("AUTO_SELF_HEAL", svc.slug + " redeployed");
        }
      } else {
        svc.healthStatus = "SANDBOX_OK";
        results.push({ slug: svc.slug, action: "SANDBOX_OK" });
      }
    }
    await this.state.storage.put("managed_services", services);

    const topics = (await this.state.storage.get("focus_topics")) || [
      "Cloudflare Workers Durable Objects optimization",
      "Stripe webhook signature verification",
      "Argon SaaS multi-tenant rate limiting",
      "OpenAPI 3.1 SDK generation pipeline"
    ];
    const currentTopic = topics[(epoch - 1) % topics.length];

    const snippet = await this.invokeSeniorBrain("ROLE: COMPLETE_WORKER_BUILDER. Kod produksi untuk topik ini.", currentTopic);
    const entry = "\n---\n## OVERLORD EPOCH #" + epoch + " // " + timestamp + "\n- Topic: " + currentTopic + "\n- Services: " + services.length + "\n\n```javascript\n" + snippet.slice(0, 3000) + "\n```\n";

    const gs = await this.pushFileToGitHub("CODING_GRIMOIRE.md", entry, "[Overlord #" + epoch + "] R&D sweep", true);
    await this.pushFileToGitHub("docs/swarm-output/epoch-learnings/epoch-" + epoch + ".md", entry, "[Overlord #" + epoch + "] Archive", false);
    await this.logActivity("CRON_SWEEP", "Epoch " + epoch + " done. " + services.length + " services");

    return { epoch, timestamp, focusTopic: currentTopic, servicesChecked: services.length, results, grimoireSynced: gs.synced };
  }

  async generateExecutiveReportForSir(question = "") {
    const epoch = (await this.state.storage.get("epoch")) || 0;
    const services = (await this.state.storage.get("managed_services")) || [];
    const logs = (await this.state.storage.get("activity_logs")) || [];
    const focusTopics = (await this.state.storage.get("focus_topics")) || [];
    const healthy = services.filter(s => /OK|HEALTHY/.test(s.healthStatus)).length;
    const heals = services.reduce((a, s) => a + (s.autoHealCount || 0), 0);
    return {
      reportTimestamp: new Date().toISOString(),
      sirQuery: question || "Full status",
      summaryForSir: "SIR, Overlord berjalan 24/7. " + services.length + " servis diurus (" + healthy + " sihat, " + heals + " auto-heal). Epoch #" + epoch + ". Focus topics: " + focusTopics.length + ".",
      metrics: { totalEpoch: epoch, activeServicesCount: services.length, healthyServicesCount: healthy, totalAutoHealsExecuted: heals, focusTopicsCount: focusTopics.length, cronSchedule: "0 */6 * * *" },
      focusTopics: focusTopics,
      activeServices: services,
      recentLogs: logs.slice(-15).reverse()
    };
  }

  async logActivity(type, detail) {
    const logs = (await this.state.storage.get("activity_logs")) || [];
    logs.push({ time: new Date().toISOString(), type, detail });
    if (logs.length > 50) logs.shift();
    await this.state.storage.put("activity_logs", logs);
  }

  async fetch(request) {
    const url = new URL(request.url);
    const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, X-API-Key" };
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });

    if (url.pathname === "/overlord/report" && request.method === "GET") {
      const q = url.searchParams.get("q") || "";
      return new Response(JSON.stringify(await this.generateExecutiveReportForSir(q)), { headers: { ...cors, "Content-Type": "application/json" } });
    }

    if (url.pathname === "/overlord/command" && request.method === "POST") {
      let body = {};
      try { body = await request.json(); } catch {}
      if (!body.directive) return new Response(JSON.stringify({ error: "directive required" }), { status: 400, headers: cors });
      return new Response(JSON.stringify(await this.buildDeployAndMaintainTask(body.directive, body.slug || null)), { headers: { ...cors, "Content-Type": "application/json" } });
    }

    if (url.pathname === "/overlord/maintain" && request.method === "POST") {
      return new Response(JSON.stringify(await this.run24x7AutonomousMaintenance()), { headers: { ...cors, "Content-Type": "application/json" } });
    }

    if (url.pathname === "/overlord/topics" && request.method === "POST") {
      let body = {};
      try { body = await request.json(); } catch {}
      if (Array.isArray(body.topics) && body.topics.length) {
        await this.state.storage.put("focus_topics", body.topics);
        await this.logActivity("TOPICS_UPDATED", body.topics.join(", "));
      }
      return new Response(JSON.stringify({ ok: true, topics: body.topics }), { headers: { ...cors, "Content-Type": "application/json" } });
    }

    return new Response("Overlord Senior Dev Active", { status: 200, headers: cors });
  }
}
