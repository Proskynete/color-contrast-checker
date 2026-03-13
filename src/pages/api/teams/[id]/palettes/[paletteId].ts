import type { APIRoute } from 'astro';

import { sql } from '../../../../../db/client';

export const DELETE: APIRoute = async ({ params, locals }) => {
  const { userId: clerkId } = locals.auth();

  if (!clerkId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { id: teamId, paletteId } = params;

  // Verify caller is team owner and team is not frozen
  const membership = (await sql.query(
    `SELECT tm.role, t.status FROM team_members tm
     JOIN teams t ON t.id = tm.team_id
     JOIN users u ON u.id = tm.user_id
     WHERE u.clerk_id = $1 AND tm.team_id = $2 AND t.status != 'deleted'`,
    [clerkId, teamId],
  )) as { role: string; status: string }[];

  if (!membership.length) {
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (membership[0].status === 'frozen') {
    return new Response(JSON.stringify({ error: 'team_frozen' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (membership[0].role !== 'owner') {
    return new Response(JSON.stringify({ error: 'Only team owners can delete team palettes' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  await sql.query(
    `DELETE FROM palettes WHERE id = $1 AND team_id = $2`,
    [paletteId, teamId],
  );

  return new Response(null, { status: 204 });
};
