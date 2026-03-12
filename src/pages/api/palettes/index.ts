import type { APIRoute } from 'astro';

import { sql } from '../../../db/client';
import { getOrCreateUser } from '../../../lib/get-or-create-user';

type PaletteRow = { id: string; name: string; colors: string; created_at: string };

const PALETTE_LIMIT: Record<string, number> = { free: 0, pro: 10, teams: 999 };

export const GET: APIRoute = async ({ locals }) => {
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

  if (PALETTE_LIMIT[user.plan] === 0) {
    return new Response(JSON.stringify({ palettes: [], plan: user.plan }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const rows = (await sql.query(
    `SELECT id, name, colors, created_at FROM palettes WHERE user_id = $1 ORDER BY created_at DESC`,
    [user.id],
  )) as PaletteRow[];

  return new Response(
    JSON.stringify({
      palettes: rows.map((r) => ({
        id: r.id,
        name: r.name,
        colors: JSON.parse(r.colors),
        createdAt: r.created_at,
      })),
      plan: user.plan,
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
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
  const limit = PALETTE_LIMIT[user.plan] ?? 0;

  if (limit === 0) {
    return new Response(JSON.stringify({ error: 'Upgrade to Pro to save palettes.' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Check current count against plan limit
  const countRows = (await sql.query(`SELECT COUNT(*) as count FROM palettes WHERE user_id = $1`, [
    user.id,
  ])) as { count: string }[];

  if (parseInt(countRows[0].count, 10) >= limit) {
    return new Response(
      JSON.stringify({ error: `Palette limit reached (${limit}). Upgrade your plan for more.` }),
      { status: 403, headers: { 'Content-Type': 'application/json' } },
    );
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
    `INSERT INTO palettes (user_id, name, colors) VALUES ($1, $2, $3) RETURNING id, name, colors, created_at`,
    [user.id, name, JSON.stringify(colors)],
  )) as PaletteRow[];

  const palette = rows[0];

  return new Response(
    JSON.stringify({ id: palette.id, name: palette.name, colors: JSON.parse(palette.colors), createdAt: palette.created_at }),
    { status: 201, headers: { 'Content-Type': 'application/json' } },
  );
};
