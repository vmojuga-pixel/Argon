const HTML_HEAD = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/><script src="https://cdn.tailwindcss.com"></script><style>body{background:#0f172a;color:#cbd5e1;font-family:system-ui,sans-serif}</style></head><body class="p-8 max-w-3xl mx-auto">
<header class="mb-8 border-b border-slate-700 pb-4 flex justify-between items-center">
  <a href="/" class="text-xl font-bold text-white tracking-tight">BorneoAI</a>
  <nav class="space-x-4 text-sm text-cyan-400"><a href="/legal/terms">Terms</a><a href="/legal/privacy">Privacy</a><a href="/login">Sign In</a></nav>
</header>`;

const HTML_FOOT = `
<footer class="mt-12 pt-6 border-t border-slate-700 text-xs text-slate-500">
  &copy; 2026 BorneoAI &mdash; NORTHERNCOAST GROUP. All rights reserved.
</footer></body></html>`;

export function renderLegal(type) {
  if (type === 'terms') return HTML_HEAD + `
  <h1 class="text-3xl font-bold text-white mb-6">Terms of Service</h1>
  <div class="space-y-4 text-sm leading-relaxed">
    <p><strong>1. Acceptance of Absolute Terms:</strong> By accessing or using BorneoAI ("the Service"), you explicitly agree to all terms stated herein. If you do not agree, you are prohibited from using the Service.</p>
    
    <p><strong>2. Service Provider Status:</strong> BorneoAI is a software-as-a-service platform operated by Northerncoast Group. We provide AI-assisted coding tools. We are NOT a law firm, financial advisor, licensed professional, or government entity. Our service does not involve life-critical systems or physical property management.</p>
    
    <p><strong>3. Absolute Waiver of Court Proceedings:</strong> You, the Customer, explicitly and irrevocably agree that you will NOT bring Northerncoast Group, its directors, employees, or agents to any court of law, tribunal, or civil dispute resolution forum for any claim, loss, damage, or dispute arising from the use of this Service. Any attempt to file a lawsuit or civil claim is a direct violation of these Terms.</p>

    <p><strong>4. Use Wisely:</strong> You are solely and entirely responsible for any code, software, content, or actions generated using the Service. Use this platform wisely. You must review, test, and verify all AI-generated outputs before deploying them.</p>
    
    <p><strong>5. "AS IS" & Full Disclaimer:</strong> The Service is provided "AS IS" and "AS AVAILABLE" without any warranties of any kind. We do not guarantee that the Service will be error-free, secure, or uninterrupted.</p>
    
    <p><strong>6. Absolute Limitation of Liability:</strong> TO THE MAXIMUM EXTENT PERMITTED BY LAW, NORTHERNCOAST GROUP SHALL NOT BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, OR BUSINESS INTERRUPTION, ARISING FROM YOUR USE OF THE SERVICE.</p>
    
    <p><strong>7. Indemnification:</strong> You agree to defend, indemnify, and hold harmless Northerncoast Group from any claims, damages, obligations, losses, liabilities, costs or debt, and expenses (including attorney's fees) arising from your use of the Service or your violation of these Terms.</p>
  </div>` + HTML_FOOT;

  if (type === 'aup') return HTML_HEAD + `
  <h1 class="text-3xl font-bold text-white mb-6">Acceptable Use Policy</h1>
  <div class="space-y-4 text-sm leading-relaxed">
    <p><strong>Prohibited Uses:</strong></p>
    <ul class="list-disc pl-5 space-y-1">
      <li>Illegal activity, fraud, or promoting violence.</li>
      <li>Harmful content (CSAM zero tolerance).</li>
      <li>Spam, phishing, or Denial of Service (DoS) attacks.</li>
      <li>Intellectual property infringement.</li>
      <li>Malware, ransomware, or crypto mining.</li>
    </ul>
    <p><strong>Enforcement:</strong> We reserve the right to suspend or terminate your account immediately without prior notice if you violate this policy.</p>
    <p><strong>Report Abuse:</strong> Please report any violations to <a href="mailto:abuse@northerncoastgroup.com" class="text-cyan-400">abuse@northerncoastgroup.com</a>.</p>
  </div>` + HTML_FOOT;

  if (type === 'privacy') return HTML_HEAD + `
  <h1 class="text-3xl font-bold text-white mb-6">Privacy Policy</h1>
  <div class="space-y-4 text-sm leading-relaxed">
    <p><strong>Data Collection:</strong> We collect only the necessary information to provide the Service, such as your email address, company name, and billing details (processed securely via our payment providers).</p>
    <p><strong>Data Security:</strong> We use industry-standard security measures (including Cloudflare Edge encryption) to protect your data. However, no method of transmission over the Internet is 100% secure.</p>
    <p><strong>Third-Party Services:</strong> We use third-party providers for AI processing (Cloudflare Workers AI) and payments (Stripe).</p>
  </div>` + HTML_FOOT;

  if (type === 'cookies') return HTML_HEAD + `
  <h1 class="text-3xl font-bold text-white mb-6">Cookie Policy</h1>
  <div class="space-y-4 text-sm leading-relaxed">
    <p><strong>Essential Cookies:</strong> We use a single essential cookie (<code class="text-cyan-400">borneoai_session</code>) to keep you logged in. This cookie is required for the Service to function.</p>
    <p><strong>No Tracking:</strong> We do not use analytics cookies, advertising trackers, or any third-party tracking pixels.</p>
  </div>` + HTML_FOOT;

  return HTML_HEAD + '<h1 class="text-3xl text-white">Not Found</h1>' + HTML_FOOT;
}
