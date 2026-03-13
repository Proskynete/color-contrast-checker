import type { APIRoute } from 'astro';
import { nanoid } from 'nanoid';

import { sql } from '../../../db/client';
import { getOrCreateUser } from '../../../lib/get-or-create-user';

type CheckRow = { id: string; share_token: string | null };
type HistoryRow = {
  id: string;
  text_color: string;
  bg_color: string;
  ratio: string;
  text_type: string;
  wcag_level: string;
  ai_assisted: boolean;
  share_token: string | null;
  created_at: string;
};

export const POST: APIRoute = async ({ request, locals }) => {
  const { userId: clerkId } = locals.auth();

  if (!clerkId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: {
    textColor: string;
    bgColor: string;
    ratio: number;
    textType: 'small' | 'large';
    wcagLevel: 'AAA' | 'AA' | 'A' | 'fail';
    aiAssisted?: boolean;
    createShareLink?: boolean;
  };

  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { textColor, bgColor, ratio, textType, wcagLevel, aiAssisted = false, createShareLink = false } = body;

  if (!textColor || !bgColor || ratio == null || !textType || !wcagLevel) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400,
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

  // Share token: free users get 7-day expiry, pro/teams get permanent
  let shareToken: string | null = null;
  let shareExpiresAt: string | null = null;

  if (createShareLink) {
    shareToken = nanoid(12);
    if (user.plan === 'free') {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 7);
      shareExpiresAt = expiry.toISOString();
    }
  }

  const rows = (await sql.query(
    `INSERT INTO checks (user_id, text_color, bg_color, ratio, text_type, wcag_level, ai_assisted, share_token, share_expires_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id, share_token`,
    [user.id, textColor, bgColor, ratio, textType, wcagLevel, aiAssisted, shareToken, shareExpiresAt],
  )) as CheckRow[];

  const check = rows[0];

  return new Response(
    JSON.stringify({
      id: check.id,
      shareToken: check.share_token,
      shareUrl: check.share_token ? `/share/${check.share_token}` : null,
    }),
    { status: 201, headers: { 'Content-Type': 'application/json' } },
  );
};

export const GET: APIRoute = async ({ url, locals }) => {
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

  // History window: free = 0 (no history), pro = 90 days, teams = 365 days
  const historyDays: Record<string, number> = { free: 0, pro: 90, teams: 365 };
  const days = historyDays[user.plan] ?? 0;

  if (days === 0) {
    return new Response(JSON.stringify({ checks: [], plan: user.plan }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const page = parseInt(url.searchParams.get('page') ?? '1', 10);
  const limit = 20;
  const offset = (page - 1) * limit;

  const rows = (await sql.query(
    `SELECT id, text_color, bg_color, ratio, text_type, wcag_level, ai_assisted, share_token, created_at
     FROM checks
     WHERE user_id = $1
       AND created_at >= now() - ($2 || ' days')::interval
     ORDER BY created_at DESC
     LIMIT $3 OFFSET $4`,
    [user.id, days, limit, offset],
  )) as HistoryRow[];

  return new Response(
    JSON.stringify({
      checks: rows.map((r) => ({
        id: r.id,
        textColor: r.text_color,
        bgColor: r.bg_color,
        ratio: parseFloat(r.ratio),
        textType: r.text_type,
        wcagLevel: r.wcag_level,
        aiAssisted: r.ai_assisted,
        shareToken: r.share_token,
        createdAt: r.created_at,
      })),
      plan: user.plan,
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
};
