import type { APIRoute } from 'astro';

import { sql } from '../../../../../db/client';

type PaletteRow = { id: string; name: string; colors: string; created_at: string };

async function getCallerTeamRole(clerkId: string, teamId: string) {
  const rows = (await sql.query(
    `SELECT tm.role, t.status FROM team_members tm
     JOIN teams t ON t.id = tm.team_id
     JOIN users u ON u.id = tm.user_id
     WHERE u.clerk_id = $1 AND tm.team_id = $2 AND t.status != 'deleted'`,
    [clerkId, teamId],
  )) as { role: string; status: string }[];
  return rows[0] ?? null;
}

export const GET: APIRoute = async ({ params, locals }) => {
  const { userId: clerkId } = locals.auth();

  if (!clerkId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { id: teamId } = params;
  const membership = await getCallerTeamRole(clerkId, teamId!);

  if (!membership) {
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const rows = (await sql.query(
    `SELECT id, name, colors, created_at FROM palettes WHERE team_id = $1 ORDER BY created_at DESC`,
    [teamId],
  )) as PaletteRow[];

  return new Response(
    JSON.stringify({
      palettes: rows.map((r) => ({
        id: r.id,
        name: r.name,
        colors: JSON.parse(r.colors),
        createdAt: r.created_at,
      })),
      role: membership.role,
      teamStatus: membership.status,
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
};

export const POST: APIRoute = async ({ params, request, locals }) => {
  const { userId: clerkId } = locals.auth();

  if (!clerkId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { id: teamId } = params;
  const membership = await getCallerTeamRole(clerkId, teamId!);

  if (!membership) {
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (membership.status === 'frozen') {
    return new Response(JSON.stringify({ error: 'team_frozen' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (membership.role !== 'owner') {
    return new Response(JSON.stringify({ error: 'Only team owners can create team palettes' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: { name: string; colors: string[] };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { name, colors } = body;

  if (!name || !Array.isArray(colors) || colors.length === 0) {
    return new Response(JSON.stringify({ error: 'name and colors are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const rows = (await sql.query(
    `INSERT INTO palettes (team_id, name, colors) VALUES ($1, $2, $3)
     RETURNING id, name, colors, created_at`,
    [teamId, name, JSON.stringify(colors)],
  )) as PaletteRow[];

  const palette = rows[0];

  return new Response(
    JSON.stringify({ id: palette.id, name: palette.name, colors: JSON.parse(palette.colors), createdAt: palette.created_at }),
    { status: 201, headers: { 'Content-Type': 'application/json' } },
  );
};
