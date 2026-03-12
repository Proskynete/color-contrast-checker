import type { APIRoute } from 'astro';

import { sql } from '../../../db/client';

type UserRow = { id: string; plan: string };
type PaletteRow = { id: string; name: string; colors: string; user_id: string; created_at: string };

export const GET: APIRoute = async ({ params, locals }) => {
  const { userId: clerkId } = locals.auth();

  if (!clerkId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const userRows = (await sql.query(`SELECT id, plan FROM users WHERE clerk_id = $1`, [clerkId])) as UserRow[];
  if (!userRows.length) {
    return new Response(JSON.stringify({ error: 'User not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
  }

  const rows = (await sql.query(
    `SELECT id, name, colors, user_id, created_at FROM palettes WHERE id = $1 AND user_id = $2`,
    [params.id, userRows[0].id],
  )) as PaletteRow[];

  if (!rows.length) {
    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
  }

  const p = rows[0];
  return new Response(
    JSON.stringify({ id: p.id, name: p.name, colors: JSON.parse(p.colors), createdAt: p.created_at }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
};

export const PUT: APIRoute = async ({ params, request, locals }) => {
  const { userId: clerkId } = locals.auth();

  if (!clerkId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const userRows = (await sql.query(`SELECT id FROM users WHERE clerk_id = $1`, [clerkId])) as UserRow[];
  if (!userRows.length) {
    return new Response(JSON.stringify({ error: 'User not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
  }

  let body: { name?: string; colors?: string[] };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const { name, colors } = body;

  if (!name && !colors) {
    return new Response(JSON.stringify({ error: 'Nothing to update' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  // Build partial update
  const updates: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (name) { updates.push(`name = $${idx++}`); values.push(name); }
  if (colors) { updates.push(`colors = $${idx++}`); values.push(JSON.stringify(colors)); }

  values.push(params.id, userRows[0].id);

  const rows = (await sql.query(
    `UPDATE palettes SET ${updates.join(', ')} WHERE id = $${idx++} AND user_id = $${idx} RETURNING id, name, colors, created_at`,
    values,
  )) as PaletteRow[];

  if (!rows.length) {
    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
  }

  const p = rows[0];
  return new Response(
    JSON.stringify({ id: p.id, name: p.name, colors: JSON.parse(p.colors), createdAt: p.created_at }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  const { userId: clerkId } = locals.auth();

  if (!clerkId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const userRows = (await sql.query(`SELECT id FROM users WHERE clerk_id = $1`, [clerkId])) as UserRow[];
  if (!userRows.length) {
    return new Response(JSON.stringify({ error: 'User not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
  }

  const rows = (await sql.query(
    `DELETE FROM palettes WHERE id = $1 AND user_id = $2 RETURNING id`,
    [params.id, userRows[0].id],
  )) as { id: string }[];

  if (!rows.length) {
    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
  }

  return new Response(null, { status: 204 });
};
