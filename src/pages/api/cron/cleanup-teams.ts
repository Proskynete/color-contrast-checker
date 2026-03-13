import type { APIRoute } from 'astro';

import { sql } from '../../../db/client';

// Vercel cron: runs daily at 00:00 UTC
// vercel.json: { "crons": [{ "path": "/api/cron/cleanup-teams", "schedule": "0 0 * * *" }] }

export const GET: APIRoute = async ({ request }) => {
  // Verify request comes from Vercel cron (or internal)
  const authHeader = request.headers.get('authorization');
  const cronSecret = import.meta.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Mark teams frozen for more than 30 days as deleted
  const result = (await sql.query(
    `UPDATE teams
     SET status = 'deleted'
     WHERE status = 'frozen'
       AND frozen_at < now() - interval '30 days'
     RETURNING id`,
  )) as { id: string }[];

  return new Response(
    JSON.stringify({ deleted: result.length, ids: result.map((r) => r.id) }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
};
