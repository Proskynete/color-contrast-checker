import { createHmac, timingSafeEqual } from 'node:crypto';

import type { APIRoute } from 'astro';

import { sql } from '../../../db/client';
import { PLAN_BY_VARIANT_ID } from '../../../lib/lemonsqueezy';

type LemonSqueezyWebhookPayload = {
  meta: {
    event_name: string;
    custom_data?: { user_id?: string };
  };
  data: {
    id: string;
    attributes: {
      status: string;
      customer_id: number;
      variant_id: number;
      user_email: string;
    };
  };
};

export const POST: APIRoute = async ({ request }) => {
  const webhookSecret = import.meta.env.LEMONSQUEEZY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return new Response('Webhook secret not configured', { status: 500 });
  }

  const signature = request.headers.get('x-signature');
  if (!signature) {
    return new Response('Missing x-signature header', { status: 400 });
  }

  const body = await request.text();

  const hmac = createHmac('sha256', webhookSecret).update(body).digest('hex');
  const isValid = timingSafeEqual(Buffer.from(hmac), Buffer.from(signature));

  if (!isValid) {
    return new Response('Invalid webhook signature', { status: 400 });
  }

  const payload: LemonSqueezyWebhookPayload = JSON.parse(body);
  const { event_name, custom_data } = payload.meta;
  const { id: subscriptionId, attributes } = payload.data;
  const { status, customer_id, variant_id } = attributes;
  const userId = custom_data?.user_id;

  const activeStatuses = ['active', 'on_trial'];
  const plan = PLAN_BY_VARIANT_ID[String(variant_id)] ?? 'free';
  const isActive = activeStatuses.includes(status);

  switch (event_name) {
    case 'subscription_created':
    case 'subscription_updated':
    case 'subscription_resumed':
    case 'subscription_unpaused': {
      if (userId) {
        await sql.query(
          `UPDATE users
           SET plan = $1, lemonsqueezy_customer_id = $2, lemonsqueezy_subscription_id = $3
           WHERE id = $4`,
          [isActive ? plan : 'free', String(customer_id), subscriptionId, userId],
        );
      }
      break;
    }

    case 'subscription_cancelled':
    case 'subscription_expired':
    case 'subscription_paused': {
      if (userId) {
        await sql.query(`UPDATE users SET plan = 'free' WHERE id = $1`, [userId]);
      }
      break;
    }
  }

  return new Response(null, { status: 200 });
};
