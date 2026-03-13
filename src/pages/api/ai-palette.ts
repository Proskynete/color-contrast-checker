import type { APIRoute } from 'astro';
import OpenAI from 'openai';

import { sql } from '../../db/client';
import { getOrCreateUser } from '../../lib/get-or-create-user';

// Inline luminance + ratio helpers (no shared import to keep edge-compatible)
function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
}

function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(hex1: string, hex2: string): number {
  const [r1, g1, b1] = hexToRgb(hex1);
  const [r2, g2, b2] = hexToRgb(hex2);
  const l1 = relativeLuminance(r1, g1, b1);
  const l2 = relativeLuminance(r2, g2, b2);
  return parseFloat(((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)).toFixed(2));
}

function isValidHex(s: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(s);
}

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
    return new Response(JSON.stringify({ error: 'Could not resolve user.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Rate limit: 10/hour (shared with ai-suggest)
  const windowStart = new Date();
  windowStart.setUTCMinutes(0, 0, 0);

  const rateLimitRows = (await sql.query(
    `INSERT INTO ai_rate_limits (user_id, window_start, call_count)
     VALUES ($1, $2, 1)
     ON CONFLICT (user_id, window_start)
     DO UPDATE SET call_count = ai_rate_limits.call_count + 1
     RETURNING call_count`,
    [user.id, windowStart.toISOString()],
  )) as { call_count: number }[];

  if (rateLimitRows[0]?.call_count > 10) {
    return new Response(JSON.stringify({ error: 'Rate limit exceeded. Try again next hour.' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: { brandColor: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { brandColor } = body;
  if (!brandColor || !isValidHex(brandColor)) {
    return new Response(JSON.stringify({ error: 'brandColor must be a valid 6-digit hex color (e.g. #1E40AF)' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey = import.meta.env.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'AI service not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const openai = new OpenAI({ apiKey });

  const prompt = `You are an expert in accessible UI design and WCAG color contrast.

Given brand color: ${brandColor}

Generate a minimal accessible UI color palette with exactly these 5 named roles:
- primary: the brand color itself
- primary_text: text that appears ON primary (white or near-white for dark brands, dark for light brands)
- secondary: a complementary or analogous accent color that pairs well with primary
- background: a light neutral surface (should not overpower the brand)
- text_primary: main body text that appears ON the background (dark, high contrast)

Rules:
- primary + primary_text must have contrast ratio ≥ 4.5 (WCAG AA)
- text_primary on background must have contrast ratio ≥ 7 (WCAG AAA preferred)
- secondary should be visually distinct from primary but harmonious

Respond ONLY with valid JSON, no markdown:
{
  "primary": "#hexcode",
  "primary_text": "#hexcode",
  "secondary": "#hexcode",
  "background": "#hexcode",
  "text_primary": "#hexcode"
}`;

  type PaletteResult = {
    primary: string;
    primary_text: string;
    secondary: string;
    background: string;
    text_primary: string;
  };

  let palette: PaletteResult | null = null;
  let parseError = false;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 300,
    });

    const raw = response.choices[0]?.message?.content?.trim() ?? '';
    palette = JSON.parse(raw) as PaletteResult;

    // Validate all values are hex
    for (const val of Object.values(palette)) {
      if (!isValidHex(val as string)) {
        parseError = true;
        break;
      }
    }
  } catch {
    parseError = true;
  }

  if (!palette || parseError) {
    return new Response(JSON.stringify({ error: 'Could not generate a valid palette. Please try again.' }), {
      status: 422,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Annotate each role with its contrast pair and ratio
  const annotations: Record<string, { against: string; ratio: number }> = {
    primary_text: { against: palette.primary, ratio: contrastRatio(palette.primary_text, palette.primary) },
    secondary: { against: palette.background, ratio: contrastRatio(palette.secondary, palette.background) },
    text_primary: { against: palette.background, ratio: contrastRatio(palette.text_primary, palette.background) },
  };

  return new Response(
    JSON.stringify({ palette, annotations }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
};
