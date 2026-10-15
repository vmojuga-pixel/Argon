import { checkAIQuota, recordAIUsage } from './tools/quota-guard.js';
const MODEL = "@cf/meta/llama-4-scout-17b-16e-instruct";
const GRIMOIRE_FILE = "CODING_GRIMOIRE.md";
const MAX_HISTORY = 25;

export class SwarmBrain {
  constructor(state, env) { this.state = state; this.env = env; this.swarmId = null; }

  async invokeAgentBrain(systemPrompt, userPrompt) {
    if (!this.env.AI) return this.deterministicHeuristicEngine(systemPrompt);

    // Free-tier quota guard
    const q = await checkAIQuota(this.env);
    if (!q.allowed) {
      console.log("[QUOTA] Daily AI limit reached:", q.used, "/", q.limit);
      return this.deterministicHeuristicEngine(systemPrompt);
    }

    try {
      const r = await this.env.AI.run(MODEL, {
        messages: [
          { role: "system", content: systemPrompt + " JAWAPAN WAJIB RINGKAS. Maksimum 4 baris. Tanpa penjelasan panjang. Tanpa mukadimah." },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 250
      });
      const out = r.response || r.result || r.text || "";
      this.env.KV && (await recordAIUsage(this.env, 30));
      return out.trim() || this.deterministicHeuristicEngine(systemPrompt);
    } catch (err) {
      console.log("[AI-FALLBACK]", err.message);
      return this.deterministicHeuristicEngine(systemPrompt);
    }
  }

  deterministicHeuristicEngine(role) {
    const ts = new Date().toISOString();
    if (role.includes("VISIONARY")) return `Topik [${ts}]: Lock-Free Ring Buffer & Circuit Breaker.`;
    if (role.includes("ARCHITECT")) return `Spesifikasi: TypedArrays, atomic flags, elak GC pause.`;
    if (role.includes("SYNTHESIZER")) return `// v1\nexport class FastRingBuffer {\n  constructor(size) { this.buf = new Array(size); this.h = 0; this.t = 0; }\n  push(x) { this.buf[this.h] = x; this.h = (this.h + 1) % this.buf.length; }\n  pop() { const v = this.buf[this.t]; this.t = (this.t + 1) % this.buf.length; return v; }\n}`;
    if (role.includes("BREAKER")) return `[KRITIKAN]:\n1. Tiada Buffer Overflow check.\n2. Modulo (%) perlahan.\n3. pop() pada kosong pulangkan undefined.`;
    if (role.includes("OPTIMIZER")) return `// v2\nexport class LockFreeRingBuffer {\n  #buf; #mask; #h = 0; #t = 0;\n  constructor(cap = 1024) {\n    if ((cap & (cap - 1)) !== 0) throw new Error("Cap kuasa dua.");\n    this.#buf = new Array(cap); this.#mask = cap - 1;\n  }\n  push(x) {\n    if (this.#h - this.#t >= this.#buf.length) return false;\n    this.#buf[this.#h++ & this.#mask] = x;\n    return true;\n  }\n  pop() {\n    if (this.#t === this.#h) return null;\n    const v = this.#buf[this.#t & this.#mask];\n    this.#buf[this.#t++ & this.#mask] = undefined;\n    return v;\n  }\n}`;
    if (role.includes("JUDGE")) return `Breakthrough: O(1) constant-time push/pop via bitwise masking.`;
    return `Sistem stabil, 40% lebih pantas.`;
  }

  // Static analysis sandbox — pattern detection only (no real exec)
  sandboxAnalyze(code) {
    const f = [];
    if (/while\s*\(\s*true\s*\)/.test(code)) f.push("Infinite loop: while(true)");
    if (/eval\s*\(/.test(code)) f.push("Unsafe eval()");
    if (/==\s*null/.test(code)) f.push("Loose null comparison");
    if (!/try\s*{/.test(code) && /await\s+/.test(code)) f.push("Async tanpa try/catch");
    if (/innerHTML/.test(code)) f.push("XSS risk: innerHTML");
    if (/process\.env/.test(code)) f.push("Environment leak: process.env");
    if (code.length > 4000) f.push("Code panjang > 4000 chars");
    return f.length ? f : ["Lulus static analysis (tiada pattern berbahaya)"];
  }

  async commitToGitHubGrimoire(entryMarkdown, epochNumber) {
    const token = this.env.GITHUB_TOKEN;
    const repo = this.env.GITHUB_REPO;
    if (!token || !repo) return { synced: false, reason: "GITHUB_TOKEN / GITHUB_REPO tiada." };
    const apiUrl = `https://api.github.com/repos/${repo}/contents/${GRIMOIRE_FILE}`;
    const headers = {
      "Authorization": `Bearer ${token}`,
      "User-Agent": "Nexus-Swarm-OS",
      "Accept": "application/vnd.github.v3+json",
      "Content-Type": "application/json"
    };
    try {
      let existing = "# BUKU KODING & PENEMUAN AGENTIC SWARM (CODING GRIMOIRE)\n\n";
      let sha = null;
      const g = await fetch(apiUrl, { headers });
      if (g.status === 200) {
        const fd = await g.json();
        sha = fd.sha;
        existing = decodeURIComponent(escape(atob(fd.content.replace(/\n/g, ""))));
      }
      const updated = existing + "\n" + entryMarkdown;
      const b64 = btoa(unescape(encodeURIComponent(updated)));
      const body = { message: `[Auto-Evolution Epoch #${epochNumber}] Swarm`, content: b64 };
      if (sha) body.sha = sha;
      const p = await fetch(apiUrl, { method: "PUT", headers, body: JSON.stringify(body) });
      if (!p.ok) return { synced: false, reason: `GitHub API: ${await p.text()}` };
      return { synced: true, reason: "Commit OK" };
    } catch (e) { return { synced: false, reason: e.message }; }
  }

  async executeEvolutionCycle(customTopic = null, onEvent = null) {
    const emit = (evt) => { if (onEvent) try { onEvent(evt); } catch {} };

    let epoch = (await this.state.storage.get("epoch")) || 0;
    epoch += 1;
    emit({ type: "epoch_start", epoch });

    const history = (await this.state.storage.get("logs")) || [];
    const prev = history.slice(-2).map(h => h.topic).join(" | ") || "Tiada rekod.";
    const transcript = [];

    emit({ type: "agent_start", agent: "01_VISIONARY" });
    const topic = customTopic || await this.invokeAgentBrain("ROLE: VISIONARY AGENT. Output: 1 baris.", `Ilmu: ${prev}. Cadang topik.`);
    transcript.push({ agent: "01_VISIONARY", output: topic });
    emit({ type: "agent_done", agent: "01_VISIONARY", output: topic });

    emit({ type: "agent_start", agent: "02_ARCHITECT" });
    const arch = await this.invokeAgentBrain("ROLE: ARCHITECT AGENT. Output: 3 bullet.", `Topik: ${topic}. Spesifikasi ringkas.`);
    transcript.push({ agent: "02_ARCHITECT", output: arch });
    emit({ type: "agent_done", agent: "02_ARCHITECT", output: arch });

    emit({ type: "agent_start", agent: "03_SYNTHESIZER" });
    const v1 = await this.invokeAgentBrain("ROLE: SYNTHESIZER AGENT. Output: kod sahaja.", `Tulis kod: ${arch}`);
    transcript.push({ agent: "03_SYNTHESIZER", output: v1 });
    emit({ type: "agent_done", agent: "03_SYNTHESIZER", output: v1 });

    emit({ type: "agent_start", agent: "04_THE_BREAKER" });
    const sandboxV1 = this.sandboxAnalyze(v1);
    const crit = await this.invokeAgentBrain("ROLE: BREAKER AGENT. Output: max 3 kelemahan.", `Kelemahan:\n${v1}`);
    transcript.push({ agent: "04_THE_BREAKER", output: crit, sandbox: sandboxV1 });
    emit({ type: "agent_done", agent: "04_THE_BREAKER", output: crit, sandbox: sandboxV1 });

    emit({ type: "agent_start", agent: "05_OPTIMIZER" });
    const v2 = await this.invokeAgentBrain("ROLE: OPTIMIZER AGENT. Output: kod sahaja.", `Kod:${v1}\nFix:${crit}`);
    const sandboxV2 = this.sandboxAnalyze(v2);
    transcript.push({ agent: "05_OPTIMIZER", output: v2, sandbox: sandboxV2 });
    emit({ type: "agent_done", agent: "05_OPTIMIZER", output: v2, sandbox: sandboxV2 });

    emit({ type: "agent_start", agent: "06_THE_JUDGE" });
    const bth = await this.invokeAgentBrain("ROLE: JUDGE AGENT. Output: 1 baris.", `Breakthrough:\n${v2}`);
    transcript.push({ agent: "06_THE_JUDGE", output: bth });
    emit({ type: "agent_done", agent: "06_THE_JUDGE", output: bth });

    const ts = new Date().toISOString();
    const entry = `\n---\n## EPOCH #${epoch} // ${ts}\n### Topik\n${topic}\n### Kod v1\n\`\`\`javascript\n${v1}\n\`\`\`\n### Kritikan + Sandbox v1\n${crit}\nSandbox: ${sandboxV1.join("; ")}\n### Kod v2\n\`\`\`javascript\n${v2}\n\`\`\`\nSandbox v2: ${sandboxV2.join("; ")}\n### Breakthrough\n${bth}\n`;

    emit({ type: "agent_start", agent: "07_THE_SCRIBE" });
    const ghStatus = await this.commitToGitHubGrimoire(entry, epoch);
    transcript.push({ agent: "07_THE_SCRIBE", output: ghStatus.synced ? `✅ Commit Epoch #${epoch}` : `❌ ${ghStatus.reason}` });
    emit({ type: "agent_done", agent: "07_THE_SCRIBE", output: ghStatus.synced ? "Commit OK" : ghStatus.reason });

    const rec = { epoch, timestamp: ts, topic, discussionTranscript: transcript, initialCode: v1, critique: crit, evolvedCode: v2, breakthroughSummary: bth, grimoireEntry: entry, githubStatus: ghStatus, sandboxV1, sandboxV2 };
    history.push(rec);
    if (history.length > MAX_HISTORY) history.shift();
    await this.state.storage.put("epoch", epoch);
    await this.state.storage.put("logs", history);

    emit({ type: "complete", epoch, githubStatus: ghStatus });
    return rec;
  }

  async fetch(request) {
    const url = new URL(request.url);
    const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Key, X-Swarm-ID" };
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });

    if (url.pathname === "/swarm/state" && request.method === "GET") {
      const epoch = (await this.state.storage.get("epoch")) || 0;
      const history = (await this.state.storage.get("logs")) || [];
      return new Response(JSON.stringify({ epoch, history }), { headers: { ...cors, "Content-Type": "application/json" } });
    }

    if (url.pathname === "/swarm/evolve" && request.method === "POST") {
      let body = {};
      try { body = await request.json(); } catch (e) {}
      const result = await this.executeEvolutionCycle(body.topic || null);
      return new Response(JSON.stringify(result), { headers: { ...cors, "Content-Type": "application/json" } });
    }

    // SSE STREAMING
    if (url.pathname === "/swarm/stream" && request.method === "GET") {
      const topic = url.searchParams.get("topic") || null;
      const self = this;
      const stream = new ReadableStream({
        async start(controller) {
          const enc = new TextEncoder();
          const send = (obj) => {
            try { controller.enqueue(enc.encode(`data: ${JSON.stringify(obj)}\n\n`)); } catch {}
          };
          try {
            await self.executeEvolutionCycle(topic, send);
          } catch (e) {
            send({ type: "error", message: e.message });
          }
          try { controller.close(); } catch {}
        }
      });
      return new Response(stream, {
        headers: { ...cors, "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Connection": "keep-alive" }
      });
    }

    return new Response("Not Found", { status: 404, headers: cors });
  }
}
