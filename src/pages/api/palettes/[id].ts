import type { APIRoute } from 'astro';

import { sql } from '../../../db/client';
import { getOrCreateUser } from '../../../lib/get-or-create-user';

type PaletteRow = { id: string; name: string; colors: string; user_id: string; created_at: string };

const notFound = () => new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
const serverError = () => new Response(JSON.stringify({ error: 'Could not resolve user' }), { status: 500, headers: { 'Content-Type': 'application/json' } });

export const GET: APIRoute = async ({ params, locals }) => {
  const { userId: clerkId } = locals.auth();
  if (!clerkId) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });

  const user = await getOrCreateUser(clerkId);
  if (!user) return serverError();

  const rows = (await sql.query(
    `SELECT id, name, colors, user_id, created_at FROM palettes WHERE id = $1 AND user_id = $2`,
    [params.id, user.id],
  )) as PaletteRow[];

  if (!rows.length) return notFound();

  const p = rows[0];
  return new Response(
    JSON.stringify({ id: p.id, name: p.name, colors: JSON.parse(p.colors), createdAt: p.created_at }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
};

export const PUT: APIRoute = async ({ params, request, locals }) => {
  const { userId: clerkId } = locals.auth();
  if (!clerkId) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });

  const user = await getOrCreateUser(clerkId);
  if (!user) return serverError();

  let body: { name?: string; colors?: string[] };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const { name, colors } = body;
  if (!name && !colors) return new Response(JSON.stringify({ error: 'Nothing to update' }), { status: 400, headers: { 'Content-Type': 'application/json' } });

  const updates: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (name) { updates.push(`name = $${idx++}`); values.push(name); }
  if (colors) { updates.push(`colors = $${idx++}`); values.push(JSON.stringify(colors)); }

  values.push(params.id, user.id);

  const rows = (await sql.query(
    `UPDATE palettes SET ${updates.join(', ')} WHERE id = $${idx++} AND user_id = $${idx} RETURNING id, name, colors, created_at`,
    values,
  )) as PaletteRow[];

  if (!rows.length) return notFound();

  const p = rows[0];
  return new Response(
    JSON.stringify({ id: p.id, name: p.name, colors: JSON.parse(p.colors), createdAt: p.created_at }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  const { userId: clerkId } = locals.auth();
  if (!clerkId) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });

  const user = await getOrCreateUser(clerkId);
  if (!user) return serverError();

  const rows = (await sql.query(
    `DELETE FROM palettes WHERE id = $1 AND user_id = $2 RETURNING id`,
    [params.id, user.id],
  )) as { id: string }[];

  if (!rows.length) return notFound();

  return new Response(null, { status: 204 });
};
