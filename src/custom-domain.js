export async function resolveTenantFromHost(env, host) {
  if (!host || host.includes('workers.dev') || host.includes('localhost')) return null;
  try {
    const row = await env.DB.prepare(
      'SELECT id, email, plan FROM tenants WHERE custom_domain = ? AND status = ? LIMIT 1'
    ).bind(host, 'active').first();
    return row || null;
  } catch {
    return null;
  }
}
