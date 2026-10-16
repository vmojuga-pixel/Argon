// Ops Applier — commits approved plan to GitHub
async function ghGet(env, path) {
  const r = await fetch("https://api.github.com/repos/vmojuga-pixel/Argon/contents/" + path, {
    headers: {
      "Authorization": "Bearer " + env.GITHUB_TOKEN,
      "User-Agent": "BorneoAI-Ops",
      "Accept": "application/vnd.github.v3+json"
    }
  });
  if (r.status === 404) return { sha: null, exists: false };
  if (!r.ok) return null;
  const d = await r.json();
  return { sha: d.sha, exists: true };
}

export async function applyOps(env, plan, commitMessage) {
  if (!env.GITHUB_TOKEN) return { ok: false, error: "GITHUB_TOKEN missing" };
  if (!plan || !Array.isArray(plan.files) || plan.files.length === 0) {
    return { ok: false, error: "Plan kosong" };
  }

  const results = [];
  for (const f of plan.files) {
    const existing = await ghGet(env, f.path);
    if (existing === null) {
      results.push({ path: f.path, ok: false, error: "GitHub GET failed" });
      continue;
    }
    const b64 = btoa(unescape(encodeURIComponent(f.newContent || "")));
    const body = {
      message: (commitMessage || "[Ops] " + f.path).slice(0, 100),
      content: b64,
      branch: "main"
    };
    if (existing.sha) body.sha = existing.sha;

    const r = await fetch("https://api.github.com/repos/vmojuga-pixel/Argon/contents/" + f.path, {
      method: "PUT",
      headers: {
        "Authorization": "Bearer " + env.GITHUB_TOKEN,
        "User-Agent": "BorneoAI-Ops",
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
    const d = await r.json();
    results.push({
      path: f.path,
      ok: r.ok,
      sha: d.commit ? d.commit.sha.slice(0, 7) : null,
      error: r.ok ? null : (d.message || "unknown")
    });
  }

  const okCount = results.filter(r => r.ok).length;
  return {
    ok: okCount > 0,
    applied: okCount,
    total: results.length,
    results: results,
    message: okCount === results.length
      ? "Semua " + okCount + " fail berjaya di-commit. GitHub Actions akan auto-deploy."
      : okCount + "/" + results.length + " berjaya."
  };
}
