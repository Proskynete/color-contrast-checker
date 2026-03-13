import type { APIRoute } from 'astro';

import { sql } from '../../../../db/client';

export const POST: APIRoute = async ({ params, request, locals }) => {
  const { userId: clerkId } = locals.auth();

  if (!clerkId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { id: teamId } = params;

  // Verify caller is the team owner
  const callerRows = (await sql.query(
    `SELECT tm.role, t.status FROM team_members tm
     JOIN teams t ON t.id = tm.team_id
     JOIN users u ON u.id = tm.user_id
     WHERE u.clerk_id = $1 AND tm.team_id = $2`,
    [clerkId, teamId],
  )) as { role: string; status: string }[];

  if (!callerRows.length) {
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (callerRows[0].role !== 'owner') {
    return new Response(JSON.stringify({ error: 'Only team owners can invite members' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (callerRows[0].status === 'frozen') {
    return new Response(JSON.stringify({ error: 'team_frozen' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Enforce 5-member cap
  const countRows = (await sql.query(
    `SELECT COUNT(*) as count FROM team_members WHERE team_id = $1`,
    [teamId],
  )) as { count: string }[];

  if (parseInt(countRows[0].count, 10) >= 5) {
    return new Response(JSON.stringify({ error: 'team_member_limit_reached' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: { email: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { email } = body;

  if (!email?.trim()) {
    return new Response(JSON.stringify({ error: 'Email is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Find user by email
  const userRows = (await sql.query(
    `SELECT id FROM users WHERE email = $1`,
    [email.trim().toLowerCase()],
  )) as { id: string }[];

  if (!userRows.length) {
    return new Response(JSON.stringify({ error: 'user_not_found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const inviteeId = userRows[0].id;

  // Check if already a member
  const existing = (await sql.query(
    `SELECT 1 FROM team_members WHERE team_id = $1 AND user_id = $2`,
    [teamId, inviteeId],
  )) as unknown[];

  if (existing.length) {
    return new Response(JSON.stringify({ error: 'User is already a team member' }), {
      status: 409,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  await sql.query(
    `INSERT INTO team_members (team_id, user_id, role) VALUES ($1, $2, 'member')`,
    [teamId, inviteeId],
  );

  return new Response(
    JSON.stringify({ success: true, email: email.trim().toLowerCase() }),
    { status: 201, headers: { 'Content-Type': 'application/json' } },
  );
};
