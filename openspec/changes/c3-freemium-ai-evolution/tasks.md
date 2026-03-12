## 1. Bug Fixes (pre-work)

- [ ] 1.1 Fix `src/pages/sections/_form.tsx:42` — change `handleSetValue('text')` to `handleSetValue('background')` for the background color field
- [ ] 1.2 Fix `src/layouts/components/footer.astro` — correct "Color Contras Checker" to "Color Contrast Checker"
- [ ] 1.3 Fix `src/layouts/landing.layout.astro` — remove duplicate `<meta name="title">` (line 17), add `<meta name="description">`, fix favicon path missing leading slash (line 13)

## 2. Astro SSR Migration

- [ ] 2.1 Install Astro Node.js SSR adapter (`@astrojs/node`)
- [ ] 2.2 Set `output: 'server'` in `astro.config.mjs` and configure adapter
- [ ] 2.3 Verify all existing pages render correctly in SSR mode (no static-only APIs used)
- [ ] 2.4 Add `.env` variables: Clerk publishable key, Clerk secret key, Neon connection string, Anthropic API key, Stripe secret key, Stripe webhook secret

## 3. Database Setup (Neon)

- [ ] 3.1 Create Neon project and obtain connection string
- [ ] 3.2 Install `@neondatabase/serverless` (HTTP driver — no persistent connections)
- [ ] 3.3 Create migration file for `users` table
- [ ] 3.4 Create migration file for `checks` table (with `ai_assisted`, `text_type`, `wcag_level`, `share_token` columns)
- [ ] 3.5 Create migration file for `palettes` table (with `palettes_single_owner` CHECK constraint)
- [ ] 3.6 Create migration file for `teams` and `team_members` tables
- [ ] 3.7 Create migration file for `ai_rate_limits` table
- [ ] 3.8 Run migrations against Neon and verify schema

## 4. Authentication (Clerk)

- [ ] 4.1 Install `@clerk/astro`
- [ ] 4.2 Add Clerk middleware to `src/middleware.ts`
- [ ] 4.3 Add `<ClerkProvider>` to `src/layouts/landing.layout.astro`
- [ ] 4.4 Add user button / sign-in button to header (`src/layouts/components/header.astro`)
- [ ] 4.5 Create Clerk webhook endpoint (`POST /api/clerk/webhook`) that inserts a `users` row on `user.created` event
- [ ] 4.6 Test sign-in flow: Google OAuth, GitHub OAuth, magic link
- [ ] 4.7 Verify core checker remains fully functional for unauthenticated users

## 5. Check History & Saving

- [ ] 5.1 Create `POST /api/checks` endpoint — saves check for authenticated users, returns created record with optional share token
- [ ] 5.2 Create `GET /api/checks` endpoint — returns history filtered by plan (90 days Pro, 365 days Teams); returns upsell for Free
- [ ] 5.3 Wire checker UI to call `POST /api/checks` after calculating contrast (authenticated users only)
- [ ] 5.4 Build check history UI page (`/history`) — table of past checks with color swatches and WCAG badges

## 6. Shareable Check URLs

- [ ] 6.1 Extend `POST /api/checks` to accept `share: true` flag and generate `share_token` with appropriate `share_expires_at` (7 days for Free, null for Pro/Teams)
- [ ] 6.2 Create `GET /api/checks/[token]` endpoint — returns check data, HTTP 410 if expired, HTTP 404 if not found
- [ ] 6.3 Create `/share/[token]` page — read-only result card with color preview, ratio, WCAG levels, and "Try it yourself" link to `/?text=X&bg=Y`
- [ ] 6.4 Add "Share" button to checker result UI (visible to authenticated users only)
- [ ] 6.5 Implement pre-fill from URL query params (`/?text=RRGGBB&bg=RRGGBB`) in the checker form

## 7. Subscription Billing (Stripe)

- [ ] 7.1 Create Stripe products and prices: Pro monthly ($9), Pro yearly ($80), Teams monthly ($29)
- [ ] 7.2 Install `stripe` npm package
- [ ] 7.3 Create `POST /api/stripe/webhook` endpoint handling `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
- [ ] 7.4 Implement idempotency check in webhook handler (ignore duplicate event IDs)
- [ ] 7.5 Implement Teams → Pro downgrade logic: set `teams.status = 'frozen'`, record `teams.frozen_at`
- [ ] 7.6 Create Stripe Checkout session endpoint for Pro and Teams upgrades
- [ ] 7.7 Create Stripe Customer Portal session endpoint for billing management
- [ ] 7.8 Build pricing/upgrade page showing Free / Pro / Teams tiers with upgrade CTAs
- [ ] 7.9 Add "Manage billing" link to account settings (opens Customer Portal)

## 8. AI Color Correction

- [ ] 8.1 Install `@anthropic-ai/sdk`
- [ ] 8.2 Create `POST /api/ai-suggest` endpoint with full server logic:
  - Authenticate via Clerk
  - Enforce rate limit via `ai_rate_limits` upsert (reject HTTP 429 at 10/hour)
  - Check and lazy-reset Free user credits (UTC month boundary)
  - Compute `adjustColor` server-side (smallest lightness delta to AA)
  - Call Claude Haiku (`claude-haiku-4-5-20251001`) with structured prompt
  - Validate each suggestion by recalculating ratio mathematically
  - Run algorithmic HSL fallback if all Claude suggestions fail
  - Return HTTP 422 if both Claude and fallback fail
  - Increment `ai_credits_used` for Free users
- [ ] 8.3 Implement algorithmic HSL fallback function (lightness shift to reach AA threshold)
- [ ] 8.4 Add AI trigger condition to contrast result component (show button when ratio < 4.5:1 small or < 3:1 large)
- [ ] 8.5 Build "Suggest with AI" button UI with auth gate (Clerk modal for unauthenticated users)
- [ ] 8.6 Build AI suggestion cards UI component (up to 3 cards: hex swatch, ratio, WCAG level, "Use this color" button)
- [ ] 8.7 Implement all AI error states in UI (timeout, rate limit, credits exhausted, no valid suggestions)
- [ ] 8.8 Build upsell modal for Free users with 0 credits remaining
- [ ] 8.9 Wire "Use this color" button to update checker and save check with `ai_assisted = true`

## 9. Saved Palettes

- [ ] 9.1 Create `POST /api/palettes` endpoint — saves palette, enforces 10-palette Pro limit (HTTP 403 `palette_limit_reached`)
- [ ] 9.2 Create `GET /api/palettes` endpoint — returns user's personal palettes
- [ ] 9.3 Create `DELETE /api/palettes/[id]` endpoint — deletes palette if caller is owner (HTTP 403 otherwise)
- [ ] 9.4 Build palette management UI — list, create, delete palettes; show upsell for Free users

## 10. Team Collaboration (Phase 3)

- [ ] 10.1 Create `POST /api/teams` endpoint — creates team, inserts owner into `team_members`, requires Teams plan
- [ ] 10.2 Create `POST /api/teams/[id]/invite` endpoint — adds member, enforces 5-user cap (HTTP 403 `team_member_limit_reached`)
- [ ] 10.3 Build team creation and invitation UI
- [ ] 10.4 Build shared brand palettes UI — list and manage team-level palettes (Teams only)
- [ ] 10.5 Implement frozen team read-only enforcement — block write operations on frozen teams (HTTP 403 `team_frozen`)
- [ ] 10.6 Implement 30-day deletion job for frozen teams (scheduled via Vercel cron or Neon background job)

## 11. Bulk Checker (Phase 3)

- [ ] 11.1 Build CSV upload component — accepts file, parses `text_color,bg_color` rows, handles invalid hex gracefully
- [ ] 11.2 Implement client-side bulk contrast calculation for all rows using existing `contrastRatio` utility
- [ ] 11.3 Build bulk results table UI — paginated at 50 rows, color swatches, ratio, WCAG level badges (color-coded pass/fail)
- [ ] 11.4 Gate bulk checker behind Teams plan with upsell prompt for Free/Pro users

## 12. PDF Reports (Phase 3)

- [ ] 12.1 Install `jspdf` and `jspdf-autotable` for client-side PDF generation
- [ ] 12.2 Implement PDF export function — generates report with title, date, summary stats, and results table
- [ ] 12.3 Add "Export PDF" button to check history view (Teams only — upsell otherwise)
- [ ] 12.4 Add "Export PDF" button to bulk checker results view (Teams only)

## 13. AI Palette Generation V2 (Phase 3)

- [ ] 13.1 Design prompt for full accessible palette generation from a single brand color (primary, secondary, backgrounds, text, states — all with WCAG ratios)
- [ ] 13.2 Create `POST /api/ai-palette` endpoint using Claude Haiku
- [ ] 13.3 Build palette generation UI — input brand color, display generated palette with ratio annotations
- [ ] 13.4 Allow saving generated palette directly to team brand palettes
