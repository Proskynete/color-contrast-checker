import { createCheckout } from '@lemonsqueezy/lemonsqueezy.js';
import type { APIRoute } from 'astro';

import { sql } from '../../../db/client';
import { setupLemonSqueezy } from '../../../lib/lemonsqueezy';

export const POST: APIRoute = async ({ request, locals }) => {
  const { userId: clerkId } = locals.auth();

  if (!clerkId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: { variantId: string; redirectUrl: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { variantId, redirectUrl } = body;

  if (!variantId || !redirectUrl) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const userRows = (await sql.query(`SELECT id, email FROM users WHERE clerk_id = $1`, [clerkId])) as {
    id: string;
    email: string;
  }[];

  if (!userRows.length) {
    return new Response(JSON.stringify({ error: 'User not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const user = userRows[0];

  setupLemonSqueezy();

  const storeId = import.meta.env.LEMONSQUEEZY_STORE_ID;

  const { data, error } = await createCheckout(storeId, variantId, {
    checkoutData: {
      email: user.email,
      custom: { user_id: user.id },
    },
    productOptions: {
      redirectUrl,
    },
  });

  if (error || !data) {
    return new Response(JSON.stringify({ error: 'Failed to create checkout' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ url: data.data.attributes.url }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
