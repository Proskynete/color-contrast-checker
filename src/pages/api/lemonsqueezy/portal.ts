import { getCustomer } from '@lemonsqueezy/lemonsqueezy.js';
import type { APIRoute } from 'astro';

import { sql } from '../../../db/client';
import { setupLemonSqueezy } from '../../../lib/lemonsqueezy';

export const GET: APIRoute = async ({ locals }) => {
  const { userId: clerkId } = locals.auth();

  if (!clerkId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const rows = (await sql.query(
    `SELECT lemonsqueezy_customer_id FROM users WHERE clerk_id = $1`,
    [clerkId],
  )) as { lemonsqueezy_customer_id: string | null }[];

  if (!rows.length || !rows[0].lemonsqueezy_customer_id) {
    return new Response(JSON.stringify({ error: 'No billing account found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  setupLemonSqueezy();

  const { data, error } = await getCustomer(rows[0].lemonsqueezy_customer_id);

  if (error || !data) {
    return new Response(JSON.stringify({ error: 'Failed to retrieve billing portal' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const portalUrl = data.data.attributes.urls?.customer_portal;

  if (!portalUrl) {
    return new Response(JSON.stringify({ error: 'Billing portal URL not available' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ url: portalUrl }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
