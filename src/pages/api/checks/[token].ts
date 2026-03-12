import type { APIRoute } from 'astro';

import { sql } from '../../../db/client';

type CheckRow = {
  id: string;
  text_color: string;
  bg_color: string;
  ratio: string;
  text_type: string;
  wcag_level: string;
  ai_assisted: boolean;
  share_expires_at: string | null;
  created_at: string;
};

export const GET: APIRoute = async ({ params }) => {
  const { token } = params;

  if (!token) {
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const rows = (await sql.query(
    `SELECT id, text_color, bg_color, ratio, text_type, wcag_level, ai_assisted, share_expires_at, created_at
     FROM checks
     WHERE share_token = $1`,
    [token],
  )) as CheckRow[];

  if (!rows.length) {
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const check = rows[0];

  if (check.share_expires_at && new Date(check.share_expires_at) < new Date()) {
    return new Response(JSON.stringify({ error: 'This shared link has expired' }), {
      status: 410,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(
    JSON.stringify({
      id: check.id,
      textColor: check.text_color,
      bgColor: check.bg_color,
      ratio: parseFloat(check.ratio),
      textType: check.text_type,
      wcagLevel: check.wcag_level,
      aiAssisted: check.ai_assisted,
      createdAt: check.created_at,
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
};
