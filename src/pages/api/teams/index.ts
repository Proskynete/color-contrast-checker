import type { APIRoute } from 'astro';

import { sql } from '../../../db/client';
import { getOrCreateUser } from '../../../lib/get-or-create-user';

type TeamRow = {
  id: string;
  name: string;
  status: string;
  role: string;
  member_count: string;
};

export const GET: APIRoute = async ({ locals }) => {
  const { userId: clerkId } = locals.auth();

  if (!clerkId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const rows = (await sql.query(
    `SELECT t.id, t.name, t.status, tm.role,
            (SELECT COUNT(*) FROM team_members WHERE team_id = t.id) AS member_count
     FROM teams t
     JOIN team_members tm ON t.id = tm.team_id
     JOIN users u ON u.id = tm.user_id
     WHERE u.clerk_id = $1 AND t.status != 'deleted'
     LIMIT 1`,
    [clerkId],
  )) as TeamRow[];

  const team = rows[0]
    ? {
        id: rows[0].id,
        name: rows[0].name,
        status: rows[0].status,
        role: rows[0].role,
        memberCount: parseInt(rows[0].member_count, 10),
      }
    : null;

  return new Response(JSON.stringify({ team }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async ({ request, locals }) => {
  const { userId: clerkId } = locals.auth();

  if (!clerkId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const user = await getOrCreateUser(clerkId);

  if (!user) {
    return new Response(JSON.stringify({ error: 'Could not resolve user' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (user.plan !== 'teams') {
    return new Response(JSON.stringify({ error: 'teams_plan_required' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: { name: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { name } = body;

  if (!name?.trim()) {
    return new Response(JSON.stringify({ error: 'Team name is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  type CreatedTeam = { id: string; name: string; status: string };

  const teamRows = (await sql.query(
    `INSERT INTO teams (name, owner_id) VALUES ($1, $2)
     RETURNING id, name, status`,
    [name.trim(), user.id],
  )) as CreatedTeam[];

  const team = teamRows[0];

  await sql.query(
    `INSERT INTO team_members (team_id, user_id, role) VALUES ($1, $2, 'owner')`,
    [team.id, user.id],
  );

  return new Response(JSON.stringify({ id: team.id, name: team.name, status: team.status }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
};
