import type { WebhookEvent } from '@clerk/astro/server';
import type { APIRoute } from 'astro';
import { Webhook } from 'svix';

import { sql } from '../../../db/client';

export const POST: APIRoute = async ({ request }) => {
  const webhookSecret = import.meta.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return new Response('Webhook secret not configured', { status: 500 });
  }

  const svixId = request.headers.get('svix-id');
  const svixTimestamp = request.headers.get('svix-timestamp');
  const svixSignature = request.headers.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response('Missing svix headers', { status: 400 });
  }

  const body = await request.text();

  let event: WebhookEvent;
  try {
    const wh = new Webhook(webhookSecret);
    event = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as WebhookEvent;
  } catch {
    return new Response('Invalid webhook signature', { status: 400 });
  }

  if (event.type === 'user.created') {
    const { id: clerkId, email_addresses, primary_email_address_id } = event.data;
    const primaryEmail = email_addresses.find((e) => e.id === primary_email_address_id);
    const email = primaryEmail?.email_address ?? '';

    await sql.query(
      `INSERT INTO users (clerk_id, email) VALUES ($1, $2) ON CONFLICT (clerk_id) DO NOTHING`,
      [clerkId, email],
    );
  }

  if (event.type === 'user.updated') {
    const { id: clerkId, email_addresses, primary_email_address_id } = event.data;
    const primaryEmail = email_addresses.find((e) => e.id === primary_email_address_id);
    const email = primaryEmail?.email_address ?? '';

    await sql.query(`UPDATE users SET email = $2 WHERE clerk_id = $1`, [clerkId, email]);
  }

  if (event.type === 'user.deleted') {
    const { id: clerkId } = event.data;
    await sql.query(`DELETE FROM users WHERE clerk_id = $1`, [clerkId]);
  }

  return new Response(null, { status: 200 });
};
