export async function sendEmail(env, opts) {
  const key = env.RESEND_API_KEY;
  if (!key) return { sent: false, reason: "RESEND_API_KEY not set" };
  const from = env.EMAIL_FROM || "Argon <onboarding@resend.dev>";
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": "Bearer " + key, "Content-Type": "application/json" },
      body: JSON.stringify({ from: from, to: opts.to, subject: opts.subject, html: opts.html, text: opts.text })
    });
    const data = await res.json();
    if (!res.ok) return { sent: false, reason: JSON.stringify(data) };
    return { sent: true, id: data.id };
  } catch (e) {
    return { sent: false, reason: e.message };
  }
}
