/**
 * [CORPUS: qwen/stack] Hono API engine — API-key auth + credit deduction + usage log
 * Tags: hono, api-key-auth, credit-system, usage-tracking, middleware, cors
 */
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { eq } from 'drizzle-orm';
import { db } from './db';
import { apiKeys, usageLogs } from './schema';

const app = new Hono();
app.use('/*', cors());

const apiKeyAuth = async (c: any, next: any) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized: Missing API Key' }, 401);
  }
  const key = authHeader.split(' ')[1];
  const [validKey] = await db.select().from(apiKeys).where(eq(apiKeys.keyHash, key)).limit(1);

  if (!validKey) return c.json({ error: 'Invalid API Key' }, 401);
  if (validKey.credits <= 0) return c.json({ error: 'Insufficient Credits' }, 402);

  c.set('apiKeyData', validKey);
  await next();

  await db.update(apiKeys)
    .set({ credits: validKey.credits - 1 })
    .where(eq(apiKeys.id, validKey.id));

  await db.insert(usageLogs).values({
    apiKeyId: validKey.id,
    endpoint: c.req.path,
    status: c.res.status
  });
};

app.get('/health', (c) => c.json({ status: 'OK', time: new Date().toISOString() }));

app.get('/api/v1/data', apiKeyAuth, async (c) => {
  return c.json({ message: 'Berjaya! Ini data premium awak.', data: { id: 1, value: 'Secret Sauce' } });
});

export default app;
