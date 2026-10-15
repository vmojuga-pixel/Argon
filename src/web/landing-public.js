export function renderPublicLanding(env, isAuthed = false) {
  const app = (env && env.APP_NAME) || "Argon";
  const ctaHref = isAuthed ? "/omni-ui" : "/login";
  const ctaText = isAuthed ? "Open Console →" : "Sign In →";
  return `<!DOCTYPE html>
<html lang="ms" class="dark">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${app} — Agentic AI Platform</title>
<meta name="description" content="Multi-tenant LLM chat, agentic tool-calling, autonomous swarm, and universal full-stack auto-coder on the edge.">
<script src="https://cdn.tailwindcss.com"><\/script>
</head>
<body class="bg-slate-950 text-slate-200 font-sans min-h-screen flex flex-col">
<header class="border-b border-slate-800/60 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
  <div class="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
    <div class="flex items-center gap-3">
      <div class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
      <span class="font-mono font-bold text-lg text-white">${app.toUpperCase()}</span>
      <span class="text-[10px] font-mono bg-slate-800 text-cyan-400 px-2 py-0.5 rounded border border-slate-700">v2.0</span>
    </div>
    <nav class="flex items-center gap-3">
      <a href="/docs" class="text-sm text-slate-400 hover:text-white transition">Docs</a>
      <a href="${ctaHref}" class="text-sm bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2 rounded-lg transition">${ctaText}</a>
    </nav>
  </div>
</header>

<main class="flex-1">
  <section class="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-300 mb-6">
      <span>● Live on Cloudflare Edge</span>
    </div>
    <h1 class="text-4xl md:text-6xl font-bold tracking-tight text-white leading-tight mb-6">
      Agentic AI infrastructure for<br class="hidden md:block" />
      <span class="bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">modern developers.</span>
    </h1>
    <p class="text-lg text-slate-400 max-w-2xl mx-auto mb-10">
      LLM chat, agentic tool-calling, autonomous 7-agent swarm, and a universal full-stack auto-coder — all running on edge in 300+ locations.
    </p>
    <div class="flex flex-wrap gap-3 justify-center">
      <a href="${ctaHref}" class="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-3 rounded-xl transition shadow-lg shadow-emerald-500/20">${ctaText}</a>
      <a href="/docs" class="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold px-6 py-3 rounded-xl transition">API Documentation</a>
    </div>
  </section>

  <section class="max-w-6xl mx-auto px-6 py-16">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-emerald-500/40 transition">
        <div class="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-4">
          <span class="text-emerald-400 font-mono font-bold text-lg">01</span>
        </div>
        <h3 class="text-white font-semibold mb-2">Chat + Agent API</h3>
        <p class="text-sm text-slate-400 leading-relaxed">LLM completion and multi-step tool-calling agents with circuit breakers, rate limits, and quota tracking built-in.</p>
      </div>
      <div class="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-cyan-500/40 transition">
        <div class="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-4">
          <span class="text-cyan-400 font-mono font-bold text-lg">02</span>
        </div>
        <h3 class="text-white font-semibold mb-2">Autonomous Swarm</h3>
        <p class="text-sm text-slate-400 leading-relaxed">7-agent council (Visionary → Architect → Breaker → Optimizer → Judge → Scribe) that evolves code 24/7.</p>
      </div>
      <div class="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-indigo-500/40 transition">
        <div class="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mb-4">
          <span class="text-indigo-400 font-mono font-bold text-lg">03</span>
        </div>
        <h3 class="text-white font-semibold mb-2">Omni Auto-Coder</h3>
        <p class="text-sm text-slate-400 leading-relaxed">Describe an app. Get full-stack Worker live at edge, committed to GitHub — UI, API, DB, and health endpoint.</p>
      </div>
    </div>
  </section>

  <section class="max-w-6xl mx-auto px-6 py-16 border-t border-slate-800/60">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
      <div>
        <div class="text-3xl font-bold text-white">~50ms</div>
        <div class="text-xs font-mono text-slate-500 mt-1">GLOBAL LATENCY</div>
      </div>
      <div>
        <div class="text-3xl font-bold text-emerald-400">300+</div>
        <div class="text-xs font-mono text-slate-500 mt-1">EDGE LOCATIONS</div>
      </div>
      <div>
        <div class="text-3xl font-bold text-cyan-400">82+</div>
        <div class="text-xs font-mono text-slate-500 mt-1">TEST COVERAGE</div>
      </div>
      <div>
        <div class="text-3xl font-bold text-indigo-400">24/7</div>
        <div class="text-xs font-mono text-slate-500 mt-1">WATCHDOG</div>
      </div>
    </div>
  </section>

  <section class="max-w-6xl mx-auto px-6 py-16">
    <div class="bg-gradient-to-br from-emerald-950/40 via-slate-900 to-indigo-950/40 border border-slate-800 rounded-3xl p-10 text-center">
      <h2 class="text-3xl font-bold text-white mb-4">Ready to build?</h2>
      <p class="text-slate-400 mb-8">Sign up and get your API key in 30 seconds.</p>
      <a href="${ctaHref}" class="inline-block bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-8 py-3 rounded-xl transition shadow-lg shadow-emerald-500/20">${ctaText}</a>
    </div>
  </section>
</main>

<footer class="border-t border-slate-800/60 py-6">
  <div class="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
    <div>${app} v2.0 — Built on Cloudflare Workers + Workers AI + Durable Objects</div>
    <div class="flex gap-4">
      <a href="/docs" class="hover:text-slate-300">Docs</a>
      <a href="/login" class="hover:text-slate-300">Login</a>
      <a href="/api/health" class="hover:text-slate-300">Status</a>
    </div>
  </div>
</footer>
</body>
</html>`;
}
