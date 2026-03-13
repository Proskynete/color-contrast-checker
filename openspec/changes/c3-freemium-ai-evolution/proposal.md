## Why

C3 is a free single-page contrast checker with strong organic traffic potential, but it generates no revenue and offers no reason for users to return. Converting it to a freemium SaaS with an AI-powered color correction feature creates a sustainable business, a clear differentiator over existing tools (WebAIM, Coolors, Accessible Palette), and a natural upgrade path from free users to paid teams.

## What Changes

- **Add authentication** (Clerk) — Google/GitHub OAuth and magic link; required to access history, shareable URLs, and AI features
- **Add persistent storage** (Neon/Postgres) — check history, saved palettes, team data, AI credits, rate limits
- **Add AI color correction** — "Suggest with AI" button on failing checks; calls Claude Haiku to generate 3 WCAG-compliant color variants; free tier gets 3 credits/month, Pro gets unlimited
- **Add subscription billing** (Stripe) — Free / Pro ($9/mo) / Teams ($29/mo) tiers with Stripe Customer Portal
- **Add shareable check URLs** — authenticated Free users get 7-day expiry links; Pro/Teams get permanent links
- **Add saved palettes** — personal (Pro, up to 10) and shared team brand palettes (Teams, unlimited)
- **Add bulk checker** (Teams) — CSV upload of color pairs, batch WCAG results
- **Add PDF/WCAG reports** (Teams) — downloadable audit reports
- **Add team collaboration** (Teams) — up to 5 users, shared palettes, owner/member roles
- **Switch Astro to SSR mode** — required for server-side API routes handling auth, AI, and webhooks
- **Fix 3 existing bugs** — background color picker bug, footer typo, landing layout meta tag issues

## Capabilities

### New Capabilities

- `user-auth`: Clerk-based authentication with Google/GitHub OAuth and magic link; session management across all gated features
- `subscription-billing`: Stripe-powered Free/Pro/Teams subscription tiers with billing portal, webhook handling, and plan enforcement
- `check-history`: Persistent storage of contrast checks per authenticated user; filtered by plan limits (90 days Pro, 1 year Teams)
- `shareable-checks`: Token-based public share URLs for checks; 7-day expiry for Free, permanent for Pro/Teams
- `ai-color-correction`: Claude Haiku AI endpoint that suggests 3 WCAG-compliant color corrections for failing checks; credit system, rate limiting, algorithmic fallback
- `saved-palettes`: Personal and team brand palette storage; Pro limit of 10, Teams unlimited with shared access
- `team-collaboration`: Team creation, member invitations (up to 5 users), shared palettes, owner/member roles, downgrade handling
- `bulk-checker`: CSV upload of color pairs with batch WCAG results (Teams tier)
- `pdf-reports`: Downloadable WCAG audit PDF reports (Teams tier)

### Modified Capabilities

*(none — no existing specs to update)*

## Impact

- **Astro config**: `output: 'server'` + SSR adapter required
- **New API routes**: `/api/checks`, `/api/ai-suggest`, `/api/stripe/webhook`, `/api/palettes`, `/api/teams`, `/api/teams/[id]/invite`
- **New dependencies**: `@clerk/astro`, `@neondatabase/serverless`, `@anthropic-ai/sdk`, `stripe`
- **Environment variables**: Clerk keys, Neon connection string, Anthropic API key, Stripe secret + webhook secret
- **Existing `.env`**: Legacy Supabase credentials can be removed
- **Bug fixes**: `src/pages/sections/_form.tsx`, `src/layouts/components/footer.astro`, `src/layouts/landing.layout.astro`
