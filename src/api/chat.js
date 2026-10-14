const CORS = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };

export async function handleChat(request, env, ctx, auth) {
  let body;
  try { body = await request.json(); } catch { return Response.json({ error: 'invalid json' }, { status: 400, headers: CORS }); }

  const sessionId = body.session_id || crypto.randomUUID();
  const message = (body.message || '').toString().slice(0, 8000);
  const history = Array.isArray(body.history) ? body.history.slice(-10) : [];
  if (!message) return Response.json({ error: 'message required' }, { status: 400, headers: CORS });

  // Rate limit via KV: 30 req / 60s per key
  const rlKey = `rl:${auth.keyId}`;
  const now = Math.floor(Date.now() / 1000);
  const rlRaw = await env.KV.get(rlKey);
  let rl = rlRaw ? JSON.parse(rlRaw) : { count: 0, reset: now + 60 };
  if (now > rl.reset) rl = { count: 0, reset: now + 60 };
  if (rl.count >= 30) {
    return Response.json({ error: 'rate limit exceeded', retry_after: rl.reset - now }, { status: 429, headers: CORS });
  }
  rl.count += 1;
  ctx.waitUntil(env.KV.put(rlKey, JSON.stringify(rl), { expirationTtl: 120 }));

  // Ensure session exists
  await env.DB.prepare(
    'INSERT INTO sessions (id, title, created_at, updated_at) VALUES (?, ?, unixepoch(), unixepoch()) ON CONFLICT(id) DO UPDATE SET updated_at = unixepoch()'
  ).bind(sessionId, message.slice(0, 60)).run();

  // Load recent history from DB
  const histRows = await env.DB.prepare(
    'SELECT role, content FROM messages WHERE session_id = ? ORDER BY created_at DESC LIMIT 10'
  ).bind(sessionId).all();
  const dbHistory = (histRows.results || []).reverse().map(r => ({ role: r.role, content: r.content }));

  const messages = [
    { role: 'system', content: 'You are Argon, a helpful assistant running on Cloudflare Workers AI.' },
    ...dbHistory,
    ...history,
    { role: 'user', content: message }
  ];

  let reply = '';
  try {
    const aiRes = await env.AI.run(env.DEFAULT_MODEL || '@cf/meta/llama-4-scout-17b-16e-instruct', { messages });
    reply = (aiRes && (aiRes.response || aiRes.result || aiRes.text)) || '';
  } catch (e) {
    return Response.json({ error: 'ai error', detail: String(e) }, { status: 502, headers: CORS });
  }

  await env.DB.batch([
    env.DB.prepare('INSERT INTO messages (session_id, role, content, created_at) VALUES (?, ?, ?, unixepoch())').bind(sessionId, 'user', message),
    env.DB.prepare('INSERT INTO messages (session_id, role, content, created_at) VALUES (?, ?, ?, unixepoch())').bind(sessionId, 'assistant', reply)
  ]);

  ctx.waitUntil(env.AUDIT.put(`audit/${sessionId}/${Date.now()}.json`, JSON.stringify({ sessionId, keyId: auth.keyId, message, reply, ts: Date.now() })));

  return Response.json({ session_id: sessionId, reply, model: env.DEFAULT_MODEL }, { headers: CORS });
}
