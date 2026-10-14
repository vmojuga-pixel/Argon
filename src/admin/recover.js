import { generateTenantKey } from '../saas/tenant.js';

export async function handleAdminRotateKey(request, env) {
  let body = {};
  try { body = await request.json(); } catch {}
  const email = (body.email || '').trim().toLowerCase();
  if (!email) return Response.json({ error: 'email required' }, { status: 400 });

  const tenant = await env.DB.prepare('SELECT id, plan FROM tenants WHERE email = ?').bind(email).first();
  if (!tenant) return Response.json({ error: 'tenant not found' }, { status: 404 });

  // Revoke semua key lama tenant ni
  await env.DB.prepare('UPDATE tenant_api_keys SET revoked = 1 WHERE tenant_id = ?').bind(tenant.id).run();

  // Generate key baru
  const k = await generateTenantKey(tenant.id, 'admin-recover', 'chat,agent,swarm');
  const id = `k_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;
  await env.DB.prepare(
    'INSERT INTO tenant_api_keys (id, tenant_id, key_hash, key_prefix, label, scopes) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(id, tenant.id, k.hash, k.prefix, k.label, k.scopes).run();

  return Response.json({
    ok: true,
    tenant_id: tenant.id,
    plan: tenant.plan,
    api_key: k.raw,
    warning: 'Semua key lama revoked. Simpan key baru ni.'
  });
}
