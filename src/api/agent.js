const CORS = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };

const TOOLS = [
  {
    name: 'read_file',
    description: 'Read a file from the R2 audit bucket or return a stub.',
    parameters: { type: 'object', properties: { path: { type: 'string' } }, required: ['path'] }
  },
  {
    name: 'run_command',
    description: 'Run a sandboxed shell command (allowlist: echo, ls, date, cat).',
    parameters: { type: 'object', properties: { cmd: { type: 'string' } }, required: ['cmd'] }
  },
  {
    name: 'list_sessions',
    description: 'List recent chat sessions from D1.',
    parameters: { type: 'object', properties: { limit: { type: 'integer' } } }
  }
];

const ALLOWED_CMD = /^(echo|ls|date|cat)\b/;

async function callTool(name, args, env) {
  if (name === 'read_file') {
    const obj = await env.AUDIT.get(args.path);
    if (!obj) return { ok: false, error: 'not found', path: args.path };
    return { ok: true, path: args.path, content: await obj.text() };
  }
  if (name === 'run_command') {
    const cmd = String(args.cmd || '').trim();
    if (!ALLOWED_CMD.test(cmd)) return { ok: false, error: 'command not allowlisted', cmd };
    let output = '';
    if (cmd.startsWith('echo ')) output = cmd.slice(5);
    else if (cmd.startsWith('date')) output = new Date().toISOString();
    else if (cmd.startsWith('ls')) output = 'audit/  sessions/  tmp/';
    else if (cmd.startsWith('cat ')) output = '[file content unavailable in sandbox]';
    return { ok: true, cmd, output };
  }
  if (name === 'list_sessions') {
    const limit = Math.min(parseInt(args.limit || 10, 10) || 10, 50);
    const rows = await env.DB.prepare('SELECT id, title, updated_at FROM sessions ORDER BY updated_at DESC LIMIT ?').bind(limit).all();
    return { ok: true, sessions: rows.results || [] };
  }
  return { ok: false, error: 'unknown tool', name };
}

export async function handleAgent(request, env, ctx, auth) {
  let body;
  try { body = await request.json(); } catch { return Response.json({ error: 'invalid json' }, { status: 400, headers: CORS }); }
  const sessionId = body.session_id || crypto.randomUUID();
  const message = (body.message || '').toString().slice(0, 8000);
  if (!message) return Response.json({ error: 'message required' }, { status: 400, headers: CORS });

  const system = `You are Argon Agent. You may call tools to accomplish tasks.
Available tools:
${TOOLS.map(t => `- ${t.name}(${Object.keys(t.parameters.properties || {}).join(', ')}): ${t.description}`).join('\n')}
To call a tool, output exactly one line: TOOL_CALL: <name> <json_args>
Otherwise, respond to the user normally.`;

  const messages = [
    { role: 'system', content: system },
    { role: 'user', content: message }
  ];

  const trace = [];
  let finalReply = '';

  for (let i = 0; i < 4; i++) {
    let aiRes;
    try {
      aiRes = await env.AI.run(env.DEFAULT_MODEL || '@cf/meta/llama-4-scout-17b-16e-instruct', { messages });
    } catch (e) {
      return Response.json({ error: 'ai error', detail: String(e), trace }, { status: 502, headers: CORS });
    }
    const text = (aiRes && (aiRes.response || aiRes.result || aiRes.text)) || '';
    const m = text.match(/TOOL_CALL:\s*(\w+)\s*(\{[\s\S]*\})/);
    if (!m) { finalReply = text; break; }

    const toolName = m[1];
    let args = {};
    try { args = JSON.parse(m[2]); } catch { args = {}; }
    const result = await callTool(toolName, args, env);
    trace.push({ step: i, tool: toolName, args, result });

    messages.push({ role: 'assistant', content: text });
    messages.push({ role: 'user', content: `TOOL_RESULT: ${JSON.stringify(result)}` });
  }

  if (!finalReply) finalReply = '(agent reached max iterations)';

  await env.DB.prepare(
    'INSERT INTO sessions (id, title, created_at, updated_at) VALUES (?, ?, unixepoch(), unixepoch()) ON CONFLICT(id) DO UPDATE SET updated_at = unixepoch()'
  ).bind(sessionId, message.slice(0, 60)).run();
  await env.DB.batch([
    env.DB.prepare('INSERT INTO messages (session_id, role, content, created_at) VALUES (?, ?, ?, unixepoch())').bind(sessionId, 'user', message),
    env.DB.prepare('INSERT INTO messages (session_id, role, content, created_at) VALUES (?, ?, ?, unixepoch())').bind(sessionId, 'assistant', finalReply)
  ]);

  ctx.waitUntil(env.AUDIT.put(`agent/${sessionId}/${Date.now()}.json`, JSON.stringify({ sessionId, keyId: auth.keyId, message, trace, finalReply, ts: Date.now() })));

  return Response.json({ session_id: sessionId, reply: finalReply, trace }, { headers: CORS });
}
