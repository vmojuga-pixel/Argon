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
