import { ImageResponse } from '@vercel/og';
import type { APIRoute } from 'astro';
import React from 'react';

const W = 1200;
const H = 630;

// Shorthand for React.createElement (no JSX needed in .ts files)
function el(
  tag: string,
  props: Record<string, unknown> | null,
  ...children: React.ReactNode[]
): React.ReactElement {
  return React.createElement(tag, props, ...children);
}

function ColorChip(color: string, label: string) {
  return el('div', { key: color, style: { display: 'flex', alignItems: 'center', gap: 10 } },
    el('div', {
      style: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: color,
        border: '2px solid #E5E7EB',
        flexShrink: 0,
      },
    }),
    el('div', { style: { display: 'flex', flexDirection: 'column', gap: 1 } },
      el('span', { style: { fontSize: 12, color: '#9CA3AF', fontWeight: 500 } }, label),
      el('span', { style: { fontSize: 16, fontWeight: 700, color: '#374151' } }, color),
    ),
  );
}

function C3Badge(dark = false) {
  return el('div', { style: { display: 'flex', alignItems: 'center', gap: 12 } },
    el('div', {
      style: {
        display: 'flex',
        width: 44,
        height: 44,
        backgroundColor: dark ? '#FFFFFF' : '#111827',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
      },
    },
      el('span', {
        style: { color: dark ? '#111827' : '#FFFFFF', fontSize: 20, fontWeight: 900 },
      }, 'C3'),
    ),
    el('span', {
      style: { fontSize: 16, color: dark ? '#9CA3AF' : '#6B7280', fontWeight: 500 },
    }, 'Color Contrast Checker'),
  );
}

// ─── Share page OG ───────────────────────────────────────────────────────────

function ShareImage(
  textColor: string,
  bgColor: string,
  ratioDisplay: string,
  level: string,
) {
  const isPass = level === 'AA' || level === 'AAA';
  const badgeColor = level === 'AAA' ? '#16A34A' : level === 'AA' ? '#2563EB' : '#DC2626';
  const badgeBg   = level === 'AAA' ? '#F0FDF4'  : level === 'AA' ? '#EFF6FF' : '#FEF2F2';

  return el('div', {
    style: {
      display: 'flex',
      width: '100%',
      height: '100%',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    },
  },
    // Left: color preview
    el('div', {
      style: {
        display: 'flex',
        width: 460,
        height: '100%',
        backgroundColor: bgColor,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      },
    },
      el('span', {
        style: {
          color: textColor,
          fontSize: 64,
          fontWeight: 900,
          letterSpacing: '-2px',
          textAlign: 'center',
        },
      }, 'Sample text'),
    ),

    // Right: info panel
    el('div', {
      style: {
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        backgroundColor: '#FFFFFF',
        padding: '52px 56px',
        justifyContent: 'space-between',
      },
    },
      // Top: badge
      C3Badge(),

      // Middle: ratio + WCAG
      el('div', { style: { display: 'flex', flexDirection: 'column', gap: 20 } },
        el('div', { style: { display: 'flex', flexDirection: 'column', gap: 4 } },
          el('span', {
            style: {
              fontSize: 13,
              color: '#9CA3AF',
              fontWeight: 600,
              letterSpacing: 3,
              textTransform: 'uppercase',
            },
          }, 'Contrast Ratio'),
          el('span', {
            style: {
              fontSize: 80,
              fontWeight: 900,
              color: '#111827',
              lineHeight: 1,
              letterSpacing: '-3px',
            },
          }, `${ratioDisplay}:1`),
        ),
        el('div', { style: { display: 'flex', alignItems: 'center', gap: 14 } },
          el('div', {
            style: {
              display: 'flex',
              backgroundColor: badgeBg,
              color: badgeColor,
              borderRadius: 10,
              padding: '10px 24px',
              fontSize: 26,
              fontWeight: 800,
            },
          }, level || 'Fail'),
          el('span', {
            style: {
              fontSize: 17,
              color: isPass ? '#16A34A' : '#DC2626',
              fontWeight: 500,
            },
          }, isPass ? 'WCAG Compliant' : 'Does not meet WCAG'),
        ),
      ),

      // Bottom: color chips
      el('div', { style: { display: 'flex', flexDirection: 'column', gap: 14 } },
        el('div', { style: { display: 'flex', gap: 24 } },
          ColorChip(textColor, 'Text'),
          ColorChip(bgColor, 'Background'),
        ),
        el('span', { style: { fontSize: 13, color: '#D1D5DB' } }, 'c3.eduardoalvarez.dev'),
      ),
    ),
  );
}

// ─── Default homepage OG ─────────────────────────────────────────────────────

const FEATURES = [
  'AI color correction suggestions',
  'Color palette harmony generator',
  'Daltonism (color blindness) simulation',
  'Image color picker',
  'Shareable check URLs',
  'Team collaboration workspace',
];

const SAMPLES = [
  { text: '#FFFFFF', bg: '#7C3AED', ratio: '5.9:1', level: 'AA' },
  { text: '#111827', bg: '#F9FAFB', ratio: '14.8:1', level: 'AAA' },
  { text: '#FFFFFF', bg: '#DC2626', ratio: '4.6:1', level: 'AA' },
];

function DefaultImage() {
  return el('div', {
    style: {
      display: 'flex',
      width: '100%',
      height: '100%',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    },
  },
    // Left: dark panel
    el('div', {
      style: {
        display: 'flex',
        flexDirection: 'column',
        width: 560,
        height: '100%',
        backgroundColor: '#111827',
        padding: '52px 52px',
        justifyContent: 'space-between',
        flexShrink: 0,
      },
    },
      el('div', { style: { display: 'flex', flexDirection: 'column', gap: 36 } },
        C3Badge(true),
        el('div', { style: { display: 'flex', flexDirection: 'column', gap: 6 } },
          el('span', {
            style: { fontSize: 42, fontWeight: 900, color: '#FFFFFF', lineHeight: 1.1, letterSpacing: '-1px' },
          }, 'Free WCAG'),
          el('span', {
            style: { fontSize: 42, fontWeight: 900, color: '#FFFFFF', lineHeight: 1.1, letterSpacing: '-1px' },
          }, 'Color Contrast'),
          el('span', {
            style: { fontSize: 42, fontWeight: 900, color: '#FFFFFF', lineHeight: 1.1, letterSpacing: '-1px' },
          }, 'Checker'),
          el('span', {
            style: { fontSize: 17, color: '#6B7280', fontWeight: 400, marginTop: 8 },
          }, 'with AI-powered suggestions'),
        ),
        el('div', { style: { display: 'flex', flexDirection: 'column', gap: 8 } },
          ...FEATURES.map(f =>
            el('div', { key: f, style: { display: 'flex', alignItems: 'center', gap: 10 } },
              el('div', {
                style: {
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  backgroundColor: '#4B5563',
                  flexShrink: 0,
                },
              }),
              el('span', { style: { fontSize: 14, color: '#9CA3AF' } }, f),
            ),
          ),
        ),
      ),
      el('span', { style: { fontSize: 14, color: '#374151' } }, 'c3.eduardoalvarez.dev'),
    ),

    // Right: sample contrast cards
    el('div', {
      style: {
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        backgroundColor: '#F3F4F6',
        padding: '44px 36px',
        gap: 18,
        justifyContent: 'center',
      },
    },
      ...SAMPLES.map(({ text, bg, ratio, level }) => {
        const badgeColor = level === 'AAA' ? '#16A34A' : '#2563EB';
        const badgeBg   = level === 'AAA' ? '#F0FDF4' : '#EFF6FF';
        return el('div', {
          key: bg,
          style: {
            display: 'flex',
            borderRadius: 14,
            overflow: 'hidden',
            height: 136,
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          },
        },
          el('div', {
            style: {
              display: 'flex',
              width: 200,
              height: '100%',
              backgroundColor: bg,
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            },
          },
            el('span', { style: { color: text, fontSize: 20, fontWeight: 700 } }, 'Sample text'),
          ),
          el('div', {
            style: {
              display: 'flex',
              flex: 1,
              backgroundColor: '#FFFFFF',
              alignItems: 'center',
              padding: '0 28px',
              gap: 24,
            },
          },
            el('div', { style: { display: 'flex', flexDirection: 'column', gap: 2 } },
              el('span', { style: { fontSize: 11, color: '#9CA3AF', fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase' } }, 'Ratio'),
              el('span', { style: { fontSize: 30, fontWeight: 900, color: '#111827' } }, ratio),
            ),
            el('div', {
              style: {
                display: 'flex',
                backgroundColor: badgeBg,
                color: badgeColor,
                borderRadius: 8,
                padding: '7px 18px',
                fontSize: 18,
                fontWeight: 800,
              },
            }, level),
          ),
        );
      }),
    ),
  );
}

// ─── Route handler ────────────────────────────────────────────────────────────

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const rawText  = url.searchParams.get('text');
  const rawBg    = url.searchParams.get('bg');
  const rawRatio = url.searchParams.get('ratio');
  const level    = url.searchParams.get('level') ?? '';

  const isShare = !!(rawText && rawBg && rawRatio);

  const element = isShare
    ? ShareImage(`#${rawText}`, `#${rawBg}`, parseFloat(rawRatio!).toFixed(2), level)
    : DefaultImage();

  return new ImageResponse(element, { width: W, height: H });
};
