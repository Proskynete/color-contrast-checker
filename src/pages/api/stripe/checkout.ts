import type { APIRoute } from 'astro';

import { sql } from '../../../db/client';
import { stripe } from '../../../lib/stripe';

export const POST: APIRoute = async ({ request, locals }) => {
  const { userId: clerkId } = locals.auth();

  if (!clerkId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: { priceId: string; successUrl: string; cancelUrl: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { priceId, successUrl, cancelUrl } = body;

  if (!priceId || !successUrl || !cancelUrl) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const userRows = (await sql.query(
    `SELECT id, email, stripe_customer_id FROM users WHERE clerk_id = $1`,
    [clerkId],
  )) as { id: string; email: string; stripe_customer_id: string | null }[];

  if (!userRows.length) {
    return new Response(JSON.stringify({ error: 'User not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const user = userRows[0];

  // Create or reuse Stripe customer
  let customerId = user.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({ email: user.email });
    customerId = customer.id;
    await sql.query(`UPDATE users SET stripe_customer_id = $1 WHERE id = $2`, [customerId, user.id]);
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return new Response(JSON.stringify({ url: session.url }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
