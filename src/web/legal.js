export function renderLegal(title, bodyHtml) {
  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${title} — Argon</title>
<script src="https://cdn.tailwindcss.com"><\/script>
</head>
<body class="bg-slate-950 text-slate-200 min-h-screen font-sans">
<header class="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
  <div class="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
    <a href="/" class="flex items-center gap-2">
      <div class="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
      <span class="font-mono font-bold text-white">ARGON</span>
    </a>
    <nav class="flex items-center gap-4 text-xs font-mono">
      <a href="/legal/terms" class="text-slate-400 hover:text-white">Terms</a>
      <a href="/legal/privacy" class="text-slate-400 hover:text-white">Privacy</a>
      <a href="/login" class="text-emerald-400 hover:text-emerald-300">Sign In</a>
    </nav>
  </div>
</header>
<main class="max-w-4xl mx-auto px-6 py-12">
  <h1 class="text-3xl font-bold text-white mb-8">${title}</h1>
  <div class="prose prose-invert prose-emerald max-w-none text-slate-300 text-sm leading-relaxed">
    ${bodyHtml}
  </div>
</main>
<footer class="border-t border-slate-800 py-6 mt-12">
  <div class="max-w-4xl mx-auto px-6 flex flex-wrap justify-between gap-3 text-xs text-slate-500">
    <div>Argon v2.0 — Legal</div>
    <div class="flex gap-4">
      <a href="/legal/terms" class="hover:text-slate-300">Terms</a>
      <a href="/legal/privacy" class="hover:text-slate-300">Privacy</a>
      <a href="/legal/aup" class="hover:text-slate-300">AUP</a>
      <a href="/legal/cookies" class="hover:text-slate-300">Cookies</a>
    </div>
  </div>
</footer>
</body></html>`;
}

export const TERMS_HTML = `<h2>1. Acceptance</h2><p>By using Argon you agree to these Terms.</p><h2>2. Service</h2><p>AI API platform — chat, agent, swarm, omni.</p><h2>3. Acceptable Use</h2><p>No illegal, harmful, or abusive content. See AUP.</p><h2>4. Billing</h2><p>Free tier limited. Paid tiers monthly. Overage charged.</p><h2>5. Liability</h2><p>No liability for indirect or consequential damages.</p><h2>6. Governing Law</h2><p>Laws of Malaysia. Courts of Kuala Lumpur.</p><p class="text-xs text-slate-500 mt-6">Template only. Consult attorney before production.</p>`;

export const PRIVACY_HTML = `<h2>1. Data We Collect</h2><p>Email, usage, content (30-day retention).</p><h2>2. How We Use</h2><p>Provide service, billing, security, improvement.</p><h2>3. Sharing</h2><p>Only Cloudflare (infra), Stripe (billing), legal authorities.</p><h2>4. Your Rights</h2><p>Access, rectify, erase, port (GDPR / PDPA).</p><h2>5. Security</h2><p>TLS 1.3 in transit, AES-256-GCM at rest, SHA-256 audit chain.</p><h2>6. Cookies</h2><p>Session cookie only. No tracking.</p><p class="text-xs text-slate-500 mt-6">Template only. Consult attorney before production.</p>`;

export const AUP_HTML = `<h2>Prohibited</h2><ul><li>Illegal activity</li><li>Harmful content (CSAM zero tolerance)</li><li>Spam, phishing, DoS</li><li>IP infringement</li><li>Malware, crypto mining</li></ul><h2>Enforcement</h2><p>Warning → suspension → ban → legal action.</p><h2>Report</h2><p>abuse@argon.dev</p>`;

export const COOKIE_HTML = `<h2>Cookies</h2><table><tr><td>argon_session</td><td>Auth</td><td>7 days</td><td>Essential</td></tr></table><h2>No Tracking</h2><p>No analytics, no ads, no third-party.</p><h2>Disable</h2><p>Browser settings. API access still works via X-API-Key.</p>`;
