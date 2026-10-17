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
    <p><strong>1. Acceptance:</strong> By accessing or using BorneoAI ("the Service"), you agree to be bound by these Terms. If you do not agree, do not use the Service.</p>
    <p><strong>2. Service Provider:</strong> BorneoAI is a software-as-a-service platform operated by Northerncoast Group. We provide AI-assisted coding tools. We are not a law firm, financial advisor, or licensed professional service.</p>
    <p><strong>3. User Responsibility:</strong> You are solely responsible for any code, software, or content generated using the Service. You must review and test all AI-generated outputs before deploying them to production.</p>
    <p><strong>4. No Warranty ("AS IS"):</strong> The Service is provided "AS IS" and "AS AVAILABLE" without warranties of any kind, either express or implied. We do not warrant that the Service will be uninterrupted, error-free, or completely secure.</p>
    <p><strong>5. Limitation of Liability:</strong> TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL NORTHERNCOAST GROUP, ITS DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM (i) YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE SERVICE; (ii) ANY CONDUCT OR CONTENT OF ANY THIRD PARTY ON THE SERVICE; (iii) ANY CONTENT OBTAINED FROM THE SERVICE; AND (iv) UNAUTHORIZED ACCESS, USE, OR ALTERATION OF YOUR TRANSMISSIONS OR CONTENT.</p>
    <p><strong>6. Indemnification:</strong> You agree to defend, indemnify, and hold harmless Northerncoast Group and its licensee and licensors, and their employees, contractors, agents, officers and directors, from and against any and all claims, damages, obligations, losses, liabilities, costs or debt, and expenses (including but not limited to attorney's fees).</p>
    <p><strong>7. Dispute Resolution:</strong> Any dispute arising out of or relating to these Terms or the Service shall be resolved through binding arbitration, rather than in court, except that you may assert claims in small claims court if your claims qualify. You waive any right to participate in a class action lawsuit.</p>
    <p><strong>8. Governing Law:</strong> These Terms shall be governed by the laws of Malaysia, without regard to its conflict of law provisions.</p>
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
    <p><strong>Enforcement:</strong> We reserve the right to suspend or terminate your account without prior notice if you violate this policy. We may also report illegal activities to the relevant authorities.</p>
    <p><strong>Report Abuse:</strong> Please report any violations to <a href="mailto:abuse@northerncoastgroup.com" class="text-cyan-400">abuse@northerncoastgroup.com</a>.</p>
  </div>` + HTML_FOOT;

  if (type === 'privacy') return HTML_HEAD + `
  <h1 class="text-3xl font-bold text-white mb-6">Privacy Policy</h1>
  <div class="space-y-4 text-sm leading-relaxed">
    <p><strong>Data Collection:</strong> We collect only the necessary information to provide the Service, such as your email address, company name, and billing details (processed securely via our payment providers). We do not sell your data to third parties.</p>
    <p><strong>Data Security:</strong> We use industry-standard security measures (including Cloudflare Edge encryption) to protect your data. However, no method of transmission over the Internet is 100% secure.</p>
    <p><strong>Third-Party Services:</strong> We use third-party providers for AI processing (Cloudflare Workers AI) and payments (Stripe). Your use of the Service is also subject to their respective privacy policies.</p>
  </div>` + HTML_FOOT;

  if (type === 'cookies') return HTML_HEAD + `
  <h1 class="text-3xl font-bold text-white mb-6">Cookie Policy</h1>
  <div class="space-y-4 text-sm leading-relaxed">
    <p><strong>Essential Cookies:</strong> We use a single essential cookie (<code class="text-cyan-400">borneoai_session</code>) to keep you logged in. This cookie is required for the Service to function and lasts for 7 days.</p>
    <p><strong>No Tracking:</strong> We do not use analytics cookies, advertising trackers, or any third-party tracking pixels.</p>
    <p><strong>Managing Cookies:</strong> You can disable cookies in your browser settings. However, disabling essential cookies will prevent you from logging into the platform.</p>
  </div>` + HTML_FOOT;

  return HTML_HEAD + '<h1 class="text-3xl text-white">Not Found</h1>' + HTML_FOOT;
}
