import type { APIRoute } from 'astro';
import OpenAI from 'openai';

import { sql } from '../../db/client';
import { getOrCreateUser } from '../../lib/get-or-create-user';

// Calculate relative luminance from hex color
function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return [r, g, b];
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
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return parseFloat(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
}

// HSL fallback: lighten or darken a color until it meets target ratio
function hexToHsl(hex: string): [number, number, number] {
  const [r, g, b] = hexToRgb(hex).map((c) => c / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToHex(h: number, s: number, l: number): string {
  const hs = s / 100;
  const ls = l / 100;
  const a = hs * Math.min(ls, 1 - ls);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = ls - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function algorithmicFallback(colorToAdjust: string, otherColor: string, targetRatio: number): string {
  const [h, s, l] = hexToHsl(colorToAdjust);
  const otherLuminance = relativeLuminance(...hexToRgb(otherColor));
  // Determine direction: if other is dark, lighten; if light, darken
  const shouldLighten = otherLuminance < 0.5;
  let currentL = l;

  for (let step = 0; step <= 100; step++) {
    currentL = shouldLighten ? Math.min(100, l + step) : Math.max(0, l - step);
    const candidate = hslToHex(h, s, currentL);
    if (contrastRatio(candidate, otherColor) >= targetRatio) {
      return candidate;
    }
  }
  return shouldLighten ? '#ffffff' : '#000000';
}

export const POST: APIRoute = async ({ request, locals }) => {
  const { userId: clerkId } = locals.auth();

  if (!clerkId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Load user (create lazily if not synced via webhook yet)
  const user = await getOrCreateUser(clerkId);

  if (!user) {
    return new Response(JSON.stringify({ error: 'Could not resolve user. Please try again.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Free plan: 3 credits/month, lazy UTC reset
  if (user.plan === 'free') {
    const now = new Date();
    const resetAt = user.ai_credits_reset_at ? new Date(user.ai_credits_reset_at) : null;
    const needsReset = !resetAt || now.getUTCMonth() !== resetAt.getUTCMonth() || now.getUTCFullYear() !== resetAt.getUTCFullYear();

    if (needsReset) {
      await sql.query(`UPDATE users SET ai_credits_used = 0, ai_credits_reset_at = now() WHERE id = $1`, [user.id]);
      user.ai_credits_used = 0;
    }

    if (user.ai_credits_used >= 3) {
      return new Response(JSON.stringify({ error: 'Monthly AI credit limit reached. Upgrade to Pro for unlimited suggestions.' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // Rate limit: 10 calls/UTC-hour per user
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

  // Parse request body
  let body: { textColor: string; bgColor: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { textColor, bgColor } = body;
  if (!textColor || !bgColor) {
    return new Response(JSON.stringify({ error: 'Missing textColor or bgColor' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const currentRatio = contrastRatio(textColor, bgColor);

  // Determine which color to adjust (smaller luminance delta = easier to fix)
  const textLum = relativeLuminance(...hexToRgb(textColor));
  const bgLum = relativeLuminance(...hexToRgb(bgColor));
  const colorToAdjust: 'text' | 'bg' = Math.abs(textLum - 0.5) > Math.abs(bgLum - 0.5) ? 'bg' : 'text';
  const adjustColor = colorToAdjust === 'text' ? textColor : bgColor;
  const fixedColor = colorToAdjust === 'text' ? bgColor : textColor;

  // Try OpenAI first, fallback to algorithmic
  let suggestions: { label: string; color: string; ratio: number; wcagLevel: string; adjusts: string }[] = [];

  try {
    const apiKey = import.meta.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('No API key');

    const openai = new OpenAI({ apiKey });

    const prompt = `You are a color accessibility expert. Given two colors that fail WCAG contrast requirements, suggest improved hex colors.

Current colors:
- Text color: ${textColor}
- Background color: ${bgColor}
- Current contrast ratio: ${currentRatio}:1

Adjust only the ${colorToAdjust} color (${adjustColor}) to improve contrast while keeping it visually similar.
The other color stays fixed at ${fixedColor}.

Provide exactly 3 suggestions as JSON array:
1. AA compliant (minimum ratio 4.5:1 for normal text)
2. AAA compliant (minimum ratio 7:1)
3. Balanced (best ratio while staying closest to original color)

Response format (JSON only, no markdown):
[
  {"label": "AA", "color": "#hexcode"},
  {"label": "AAA", "color": "#hexcode"},
  {"label": "Balanced", "color": "#hexcode"}
]`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 200,
    });

    const raw = response.choices[0]?.message?.content?.trim() ?? '';
    const parsed = JSON.parse(raw) as { label: string; color: string }[];

    suggestions = parsed
      .filter((s) => /^#[0-9a-fA-F]{6}$/.test(s.color))
      .map((s) => {
        const ratio = contrastRatio(
          colorToAdjust === 'text' ? s.color : textColor,
          colorToAdjust === 'bg' ? s.color : bgColor,
        );
        const wcagLevel = ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : ratio >= 3 ? 'A' : 'fail';
        return { label: s.label, color: s.color, ratio, wcagLevel, adjusts: colorToAdjust };
      });
  } catch {
    // Algorithmic fallback
    const aa = algorithmicFallback(adjustColor, fixedColor, 4.5);
    const aaa = algorithmicFallback(adjustColor, fixedColor, 7);
    const balanced = algorithmicFallback(adjustColor, fixedColor, 4.5);

    suggestions = [
      { label: 'AA', color: aa, ratio: contrastRatio(colorToAdjust === 'text' ? aa : textColor, colorToAdjust === 'bg' ? aa : bgColor), wcagLevel: 'AA', adjusts: colorToAdjust },
      { label: 'AAA', color: aaa, ratio: contrastRatio(colorToAdjust === 'text' ? aaa : textColor, colorToAdjust === 'bg' ? aaa : bgColor), wcagLevel: 'AAA', adjusts: colorToAdjust },
      { label: 'Balanced', color: balanced, ratio: contrastRatio(colorToAdjust === 'text' ? balanced : textColor, colorToAdjust === 'bg' ? balanced : bgColor), wcagLevel: 'AA', adjusts: colorToAdjust },
    ];
  }

  // Increment credit usage for free users
  if (user.plan === 'free') {
    await sql.query(`UPDATE users SET ai_credits_used = ai_credits_used + 1 WHERE id = $1`, [user.id]);
  }

  return new Response(
    JSON.stringify({ suggestions, adjusts: colorToAdjust }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
};
