// Ops Planner — AI reads repo + directive, proposes patch plan
const MODEL = "@cf/meta/llama-4-scout-17b-16e-instruct";

const SYS = `You are an autonomous coding agent for the Argon/BorneoAI repository on Cloudflare Workers.
Given a directive from the owner, propose a plan to modify files.

RULES:
1. Output STRICT JSON only. No markdown. No explanation outside JSON.
2. Schema: {"summary":"1-line","files":[{"path":"...","action":"edit|create","content":"FULL new content"}]}
3. For "edit": include FULL new file content (not diff).
4. For "create": include full content of new file.
5. Max 2 files per plan. Small focused changes only.
6. If directive is unclear or risky (deletes, secrets, .env), return: {"summary":"Cannot do: reason","files":[]}
7. Never touch: package-lock.json, .git/, /node_modules, wrangler secrets.
8. Use Malaysia-friendly BM in summary if directive is in BM.`;

const KEYWORDS = {
  "landing|hero|pricing|faq|borneoai|baobao": ["src/web/landing-public.js"],
  "login|signup|daftar": ["src/web/login.js", "src/web/signup.js"],
  "app|dashboard|console": ["src/web/app.js"],
  "baobao|chat": ["src/web/baobao-page.js"],
  "route|api|endpoint": ["src/index.js"],
  "swarm": ["src/swarm.js"],
  "overlord": ["src/overlord.js"],
  "omni": ["src/omni-overlord.js"],
  "handover|journey|docs": ["HANDOVER.md", "docs/JOURNEY.md"],
};

function pickFiles(directive) {
  const d = directive.toLowerCase();
  const hits = new Set();
  for (const [pat, files] of Object.entries(KEYWORDS)) {
    if (new RegExp(pat, "i").test(d)) files.forEach(f => hits.add(f));
  }
  if (hits.size === 0) hits.add("src/web/landing-public.js");
  return Array.from(hits).slice(0, 3);
}

async function gh(env, path, raw) {
  const url = "https://api.github.com/repos/vmojuga-pixel/Argon/contents/" + path;
  const r = await fetch(url, {
    headers: {
      "Authorization": "Bearer " + env.GITHUB_TOKEN,
      "User-Agent": "BorneoAI-Ops",
      "Accept": raw ? "application/vnd.github.raw" : "application/vnd.github.v3+json"
    }
  });
  if (!r.ok) return null;
  return raw ? await r.text() : await r.json();
}

export async function planOps(env, directive) {
  if (!directive || directive.length < 3) return { ok: false, error: "Directive terlalu pendek" };
  if (!env.GITHUB_TOKEN) return { ok: false, error: "GITHUB_TOKEN missing" };

  const paths = pickFiles(directive);
  const files = [];
  for (const p of paths) {
    const content = await gh(env, p, true);
    if (content) files.push({ path: p, content: content.slice(0, 8000) });
  }
  if (files.length === 0) return { ok: false, error: "Tak jumpa fail yang sesuai" };

  const ctx = files.map(f => "=== FILE: " + f.path + " ===\n" + f.content).join("\n\n");

  let plan = null;
  try {
    const r = await env.AI.run(MODEL, {
      messages: [
        { role: "system", content: SYS },
        { role: "user", content: "DIRECTIVE: " + directive + "\n\nCURRENT FILES:\n" + ctx }
      ],
      max_tokens: 4000,
      temperature: 0.2
    });
    let raw = (r.response || r.result || "").trim();
    raw = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
    plan = JSON.parse(raw);
  } catch (e) {
    return { ok: false, error: "AI parse fail: " + e.message };
  }

  if (!plan || !Array.isArray(plan.files) || plan.files.length === 0) {
    return { ok: false, error: plan && plan.summary ? plan.summary : "AI tak propose apa-apa" };
  }

  // Preview old content for each file
  const preview = [];
  for (const f of plan.files) {
    const old = files.find(x => x.path === f.path);
    preview.push({
      path: f.path,
      action: f.action || "edit",
      oldSize: old ? old.content.length : 0,
      newSize: (f.content || "").length,
      newContent: f.content || "",
      preview: (f.content || "").slice(0, 500)
    });
  }

  return { ok: true, summary: plan.summary || directive, files: preview };
}
