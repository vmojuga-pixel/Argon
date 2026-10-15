/**
 * [CORPUS: qwen/stack] Stripe checkout + webhook with atomic credit topup
 * Tags: stripe, webhook, credit-topup, checkout, hmac, atomic-increment
 *
 * NOTE (corpus fix from original Qwen): the original had an invalid
 * `db.$with(...)` chain. Correct approach is `sql\`column + value\``.
 * Always validate webhook signature before trusting event data.
 */
import { Hono } from 'hono';
import Stripe from 'stripe';
import { sql, eq } from 'drizzle-orm';
import { db } from '../db';
import { apiKeys } from '../schema';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });
const app = new Hono();

app.post('/create-checkout-session', async (c) => {
  const { apiKeyId, creditsToBuy } = await c.req.json();
  if (!apiKeyId || !Number.isInteger(creditsToBuy) || creditsToBuy <= 0) {
    return c.json({ error: 'invalid payload' }, 400);
  }

  const [keyRecord] = await db.select().from(apiKeys).where(eq(apiKeys.id, apiKeyId)).limit(1);
  if (!keyRecord) return c.json({ error: 'Invalid API Key ID' }, 404);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: { name: `Topup ${creditsToBuy} API Credits` },
        unit_amount: creditsToBuy * 10,
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: `${process.env.FRONTEND_URL}/dashboard?success=true`,
    cancel_url: `${process.env.FRONTEND_URL}/dashboard?canceled=true`,
    metadata: { apiKeyId, credits: creditsToBuy.toString() },
  });

  return c.json({ url: session.url });
});

app.post('/webhook', async (c) => {
  const sig = c.req.header('stripe-signature');
  if (!sig) return c.json({ error: 'missing signature' }, 400);

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      await c.req.text(),
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err: any) {
    return c.json({ error: `Webhook Error: ${err.message}` }, 400);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const apiKeyId = session.metadata?.apiKeyId;
    const credits = parseInt(session.metadata?.credits || '0', 10);

    if (apiKeyId && credits > 0) {
      // Atomic increment — no read-modify-write race
      await db.update(apiKeys)
        .set({ credits: sql`${apiKeys.credits} + ${credits}` })
        .where(eq(apiKeys.id, apiKeyId));
    }
  }

  return c.json({ received: true });
});

export default app;
