// Cloudflare Email Service sender (replaces Resend)
// Uses native Workers EMAIL binding — no API key required
export async function sendEmail(env, opts) {
  console.log('[EMAIL_DEBUG] binding=' + (env.EMAIL ? 'yes' : 'no') + ' to=' + opts.to);
  const email = env.EMAIL;

  // Fallback ke Resend if EMAIL binding not available
  if (!email) {
    const resendKey = env.RESEND_API_KEY;
    if (!resendKey) return { sent: false, reason: "EMAIL binding + RESEND_API_KEY both missing" };
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Authorization": "Bearer " + resendKey, "Content-Type": "application/json" },
        body: JSON.stringify({ from: env.EMAIL_FROM || "Argon <onboarding@resend.dev>", to: opts.to, subject: opts.subject, html: opts.html, text: opts.text })
      });
      const data = await res.json();
      if (!res.ok) return { sent: false, reason: JSON.stringify(data) };
      return { sent: true, id: data.id, provider: "resend" };
    } catch (e) {
      return { sent: false, reason: e.message };
    }
  }

  try {
    const from = env.EMAIL_FROM || "Argon <noreply@argon.vmojuga.workers.dev>";
    const result = await email.send({
      to: opts.to,
      from: from,
      subject: opts.subject,
      html: opts.html,
      text: opts.text
    });
    console.log("[EMAIL_DEBUG] CF OK id=" + result.messageId);
    return { sent: true, id: result.messageId, provider: "cloudflare" };
  } catch (e) {
    console.log("[EMAIL_DEBUG] CF FAIL code=" + (e.code || "none") + " msg=" + e.message);
    return { sent: false, reason: (e.code || "ERR") + ": " + e.message };
  }
}
