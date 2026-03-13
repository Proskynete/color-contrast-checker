## Why

C3 is a free single-page contrast checker with strong organic traffic potential, but it generates no revenue and offers no reason for users to return. Converting it to a freemium SaaS with an AI-powered color correction feature creates a sustainable business, a clear differentiator over existing tools (WebAIM, Coolors, Accessible Palette), and a natural upgrade path from free users to paid teams.

## What Changes

- **Add authentication** (Clerk) — Google/GitHub OAuth and magic link; required to access history, shareable URLs, and AI features ✅
- **Add persistent storage** (Neon/Postgres) — check history, saved palettes, team data, AI credits, rate limits ✅
- **Add AI color correction** — "Suggest with AI" button on failing checks; calls OpenAI GPT-4o-mini to generate 3 WCAG-compliant color variants; free tier gets 3 credits/month, Pro gets unlimited ✅ *(AI provider changed from Claude Haiku to OpenAI GPT-4o-mini)*
- **Add subscription billing** (Lemon Squeezy) — Free / Pro ($9/mo) / Teams ($29/mo) tiers with Lemon Squeezy checkout, webhooks, pricing page, and customer billing portal ✅ *(billing provider changed from Stripe to Lemon Squeezy)*
- **Add shareable check URLs** — authenticated Free users get 7-day expiry links; Pro/Teams get permanent links; share page, share button, and URL pre-fill all implemented ✅
- **Add saved palettes** — personal (Pro, up to 10) and shared team brand palettes (Teams, unlimited) ✅
- **Add bulk checker** (Teams) — CSV upload of color pairs, client-side batch WCAG calculation, paginated results table, PDF export ✅
- **Add PDF/WCAG reports** (Teams) — downloadable audit PDFs for check history and bulk checker results via jspdf ✅
- **Add team collaboration** (Teams) — up to 5 users, shared palettes, owner/member roles, frozen team enforcement, 30-day cleanup cron ✅
- **Add AI palette generator** — GPT-4o-mini generates full 8-role accessible color system from a brand color; save to personal or team palettes ✅
- **Switch Astro to SSR mode** — required for server-side API routes handling auth, AI, and webhooks ✅
- **Fix 3 existing bugs** — background color picker bug, footer typo, landing layout meta tag issues ✅
- **Redesign UI** — asymmetric 1fr/2fr grid layout, tools panel with 5 tabs (palette, color history, export, daltonism simulation), RGB/HSL display, color history, real logo in header ✅
- **Internationalize UI** — full English translation of all labels, messages, and UI text for global audience ✅

## Capabilities

### New Capabilities

- `user-auth`: Clerk-based authentication with Google/GitHub OAuth and magic link; session management across all gated features ✅
- `subscription-billing`: Lemon Squeezy-powered Free/Pro/Teams subscription tiers with checkout, webhook handling, plan enforcement, pricing page (`/pricing`), and customer billing portal (`/api/lemonsqueezy/portal`) ✅ *(was Stripe)*
- `check-history`: Persistent storage of contrast checks per authenticated user; filtered by plan limits (90 days Pro, 1 year Teams) ✅
- `shareable-checks`: Token-based public share URLs for checks; 7-day expiry for Free, permanent for Pro/Teams; share page (`/share/[token]`), Share button in UI, and URL pre-fill from query params ✅
- `ai-color-correction`: OpenAI GPT-4o-mini endpoint that suggests 3 WCAG-compliant color corrections for failing checks; credit system, rate limiting, algorithmic fallback ✅ *(was Claude Haiku)*
- `saved-palettes`: Personal and team brand palette storage; Pro limit of 10, Teams unlimited with shared access ✅
- `ui-tools-panel`: Tools panel with 5 tabs — color palette harmony generator, color history, palette export, daltonism simulation, RGB/HSL display ✅
- `team-collaboration`: Team creation, member invitations (up to 5 users), shared palettes, owner/member roles, downgrade handling, Vercel cron for 30-day frozen team deletion ✅
- `bulk-checker`: CSV upload with drag-and-drop, client-side batch WCAG calculation, paginated table (50/page), WCAG badges, PDF export; Teams-only with upsell for Free/Pro ✅
- `pdf-reports`: Client-side PDF export via `jspdf` + `jspdf-autotable`; available in check history and bulk checker (Teams only) ✅
- `ai-palette-generator`: OpenAI GPT-4o-mini generates 8-role accessible palette (primary, secondary, background, text variants) from a brand color; contrast ratio annotations; save to personal or team palettes ✅

### Modified Capabilities

*(none — no existing specs to update)*

## Impact

- **Astro config**: `output: 'server'` + SSR adapter required
- **New API routes**: `/api/checks`, `/api/checks/[token]`, `/api/ai-suggest`, `/api/ai-palette`, `/api/lemonsqueezy/checkout`, `/api/lemonsqueezy/webhook`, `/api/lemonsqueezy/portal`, `/api/palettes`, `/api/palettes/[id]`, `/api/clerk/webhook`, `/api/teams`, `/api/teams/[id]`, `/api/teams/[id]/invite`, `/api/teams/[id]/palettes`, `/api/teams/[id]/palettes/[paletteId]`, `/api/cron/cleanup-teams` ✅
- **New pages**: `/share/[token]` (public share card), `/pricing` (tier comparison + upgrade CTAs) ✅
- **New dependencies**: `@clerk/astro`, `@neondatabase/serverless`, `openai`, `@lemonsqueezy/lemonsqueezy.js`, `jspdf`, `jspdf-autotable` ✅ *(was `@anthropic-ai/sdk` + `stripe`)*
- **Astro**: Downgraded to v5 (v6 had build issues with Vercel adapter); uses `@astrojs/vercel` adapter (not `@astrojs/node`) ✅
- **Environment variables**: Clerk keys, Neon connection string, OpenAI API key, Lemon Squeezy keys + webhook secret ✅
- **Existing `.env`**: Legacy Supabase credentials removed ✅
- **Bug fixes**: `src/pages/sections/_form.tsx`, `src/layouts/components/footer.astro`, `src/layouts/landing.layout.astro` ✅
