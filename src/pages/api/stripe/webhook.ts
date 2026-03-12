import type { APIRoute } from 'astro';
import type Stripe from 'stripe';

import { sql } from '../../../db/client';
import { PLAN_BY_PRICE_ID, stripe } from '../../../lib/stripe';

export const POST: APIRoute = async ({ request }) => {
  const webhookSecret = import.meta.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return new Response('Webhook secret not configured', { status: 500 });
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return new Response('Missing stripe-signature header', { status: 400 });
  }

  const body = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return new Response('Invalid webhook signature', { status: 400 });
  }

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const priceId = subscription.items.data[0]?.price.id;
      const customerId = subscription.customer as string;
      const plan = PLAN_BY_PRICE_ID[priceId] ?? 'free';
      const isActive = subscription.status === 'active' || subscription.status === 'trialing';

      await sql.query(`UPDATE users SET plan = $1 WHERE stripe_customer_id = $2`, [
        isActive ? plan : 'free',
        customerId,
      ]);
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      await sql.query(`UPDATE users SET plan = 'free' WHERE stripe_customer_id = $1`, [customerId]);
      break;
    }
  }

  return new Response(null, { status: 200 });
};
