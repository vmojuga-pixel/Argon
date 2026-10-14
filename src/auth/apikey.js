export async function validateApiKey(request, env) {
  const h = request.headers.get('x-api-key') || '';
  const bearer = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  const key = (h || bearer || '').trim();
  if (!key) return { ok: false, error: 'missing api key' };

  const row = await env.DB.prepare(
    'SELECT id, key FROM api_keys WHERE key = ? AND active = 1 LIMIT 1'
  ).bind(key).first();

  if (!row) return { ok: false, error: 'invalid api key' };
  await env.DB.prepare('UPDATE api_keys SET last_used = unixepoch() WHERE id = ?').bind(row.id).run();
  return { ok: true, keyId: row.id, key };
}

export async function validateBasicAuth(request, env) {
  const auth = request.headers.get('authorization') || '';
  if (!auth.startsWith('Basic ')) return { ok: false, error: 'missing basic auth' };

  const decoded = atob(auth.slice(6));
  const idx = decoded.indexOf(':');
  if (idx < 0) return { ok: false, error: 'malformed basic auth' };
  const user = decoded.slice(0, idx);
  const pass = decoded.slice(idx + 1);

  const expectedUser = env.BASIC_AUTH_USER || 'argon';
  const expectedPass = env.BASIC_AUTH_PASS;
  if (!expectedPass) return { ok: false, error: 'basic auth not configured' };
  if (user !== expectedUser || pass !== expectedPass) return { ok: false, error: 'invalid credentials' };

  return { ok: true, user };
}
