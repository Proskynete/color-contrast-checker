import type { APIRoute } from 'astro';

import { sql } from '../../../../db/client';

type MemberRow = {
  user_id: string;
  email: string;
  role: string;
  joined_at: string;
};

export const GET: APIRoute = async ({ params, locals }) => {
  const { userId: clerkId } = locals.auth();

  if (!clerkId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { id } = params;

  // Verify caller is a member of this team
  const memberCheck = (await sql.query(
    `SELECT tm.role FROM team_members tm
     JOIN users u ON u.id = tm.user_id
     WHERE u.clerk_id = $1 AND tm.team_id = $2`,
    [clerkId, id],
  )) as { role: string }[];

  if (!memberCheck.length) {
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const teamRows = (await sql.query(
    `SELECT id, name, status, frozen_at, created_at FROM teams WHERE id = $1 AND status != 'deleted'`,
    [id],
  )) as { id: string; name: string; status: string; frozen_at: string | null; created_at: string }[];

  if (!teamRows.length) {
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const members = (await sql.query(
    `SELECT tm.user_id, u.email, tm.role, tm.team_id as joined_at
     FROM team_members tm
     JOIN users u ON u.id = tm.user_id
     WHERE tm.team_id = $1`,
    [id],
  )) as MemberRow[];

  const team = teamRows[0];

  return new Response(
    JSON.stringify({
      id: team.id,
      name: team.name,
      status: team.status,
      frozenAt: team.frozen_at,
      createdAt: team.created_at,
      callerRole: memberCheck[0].role,
      members: members.map((m) => ({
        userId: m.user_id,
        email: m.email,
        role: m.role,
      })),
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
};
