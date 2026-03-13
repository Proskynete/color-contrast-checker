## 1. Bug Fixes (pre-work)

- [x] 1.1 Fix `src/pages/sections/_form.tsx:42` — change `handleSetValue('text')` to `handleSetValue('background')` for the background color field
- [x] 1.2 Fix `src/layouts/components/footer.astro` — correct "Color Contras Checker" to "Color Contrast Checker"
- [x] 1.3 Fix `src/layouts/landing.layout.astro` — remove duplicate `<meta name="title">` (line 17), add `<meta name="description">`, fix favicon path missing leading slash (line 13)

## 2. Astro SSR Migration

- [x] 2.1 Install Astro SSR adapter — used `@astrojs/vercel` (not `@astrojs/node`; node adapter conflicted with Astro v6 on Vercel)
- [x] 2.2 Set `output: 'server'` in `astro.config.mjs` and configure adapter
- [x] 2.3 Verify all existing pages render correctly in SSR mode (no static-only APIs used)
- [x] 2.4 Add `.env` variables: Clerk publishable key, Clerk secret key, Neon connection string, OpenAI API key, Lemon Squeezy keys + webhook secret
- [x] 2.5 *(unplanned)* Downgrade from Astro v6 to Astro v5 to fix `before-hydration` 404 on Vercel
- [x] 2.6 *(unplanned)* Add `.npmrc` with `legacy-peer-deps` for Vercel CI compatibility
- [x] 2.7 *(unplanned)* Set `build.assets = '_astro'` explicitly to fix static file paths

## 3. Database Setup (Neon)

- [x] 3.1 Create Neon project and obtain connection string
- [x] 3.2 Install `@neondatabase/serverless` (HTTP driver — no persistent connections)
- [x] 3.3 Create migration `001_users.sql` — `users` table
- [x] 3.4 Create migration `003_checks.sql` — `checks` table (with `ai_assisted`, `text_type`, `wcag_level`, `share_token` columns)
- [x] 3.5 Create migration `004_palettes.sql` — `palettes` table (with `palettes_single_owner` CHECK constraint)
- [x] 3.6 Create migrations `002_teams.sql` — `teams` and `team_members` tables
- [x] 3.7 Create migration `005_ai_rate_limits.sql` — `ai_rate_limits` table
- [x] 3.8 Run migrations against Neon and verify schema
- [x] 3.9 *(unplanned)* Create migration `006_users_stripe.sql` — add `stripe_customer_id` column (later superseded)
- [x] 3.10 *(unplanned)* Create migration `007_users_lemonsqueezy.sql` — replace `stripe_customer_id` with `lemonsqueezy_customer_id` + `lemonsqueezy_subscription_id`

## 4. Authentication (Clerk)

- [x] 4.1 Install `@clerk/astro`
- [x] 4.2 Add Clerk middleware to `src/middleware.ts`
- [x] 4.3 Add `<ClerkProvider>` to `src/layouts/landing.layout.astro`
- [x] 4.4 Add user button / sign-in button to header (`src/layouts/components/header.astro`)
- [x] 4.5 Create Clerk webhook endpoint (`POST /api/clerk/webhook`) that inserts a `users` row on `user.created` event
- [x] 4.6 Test sign-in flow: Google OAuth, GitHub OAuth, magic link
- [x] 4.7 Verify core checker remains fully functional for unauthenticated users
- [x] 4.8 *(unplanned)* Fix sign-in flow to trigger modal instead of redirecting to `/sign-in`
- [x] 4.9 *(unplanned)* Add lazy user creation fallback for when Clerk webhook is not yet configured

## 5. Check History & Saving

- [x] 5.1 Create `POST /api/checks` endpoint — saves check for authenticated users, returns created record with optional share token
- [x] 5.2 Create `GET /api/checks` endpoint — returns history filtered by plan (90 days Pro, 365 days Teams); returns upsell for Free
- [x] 5.3 Wire checker UI to call `POST /api/checks` after calculating contrast (authenticated users only)
- [x] 5.4 Build check history UI (`_check-history.tsx`) — table of past checks with color swatches and WCAG badges

## 6. Shareable Check URLs

- [x] 6.1 Extend `POST /api/checks` to accept `share: true` flag and generate `share_token` with appropriate `share_expires_at` (7 days for Free, null for Pro/Teams)
- [x] 6.2 Create `GET /api/checks/[token]` endpoint — returns check data, HTTP 410 if expired, HTTP 404 if not found
- [x] 6.3 Create `/share/[token]` page — read-only result card with color preview, ratio, WCAG levels, and "Try it yourself" link to `/?text=X&bg=Y`
- [x] 6.4 Add "Share" button to checker result UI (visible to authenticated users only)
- [x] 6.5 Implement pre-fill from URL query params (`/?text=RRGGBB&bg=RRGGBB`) in the checker form

## 7. Subscription Billing (Lemon Squeezy)

> ⚠️ Originally specified as Stripe. Changed to Lemon Squeezy during implementation. Tasks below reflect the actual implementation.

- [x] 7.1 Create Lemon Squeezy products and variants: Pro monthly ($9), Pro yearly ($80), Teams monthly ($29)
- [x] 7.2 Install `@lemonsqueezy/lemonsqueezy.js`
- [x] 7.3 Create `POST /api/lemonsqueezy/webhook` endpoint handling subscription events and plan enforcement
- [x] 7.4 Add variant ID → plan mapping (including Teams yearly variant fix)
- [x] 7.5 Implement Teams → Pro downgrade logic: set `teams.status = 'frozen'`, record `teams.frozen_at`
- [x] 7.6 Create Lemon Squeezy checkout session endpoint (`POST /api/lemonsqueezy/checkout`)
- [x] 7.7 Create billing management link (Lemon Squeezy Customer Portal)
- [x] 7.8 Build pricing/upgrade page showing Free / Pro / Teams tiers with upgrade CTAs
- [x] 7.9 Add "Manage billing" link to account settings

## 8. AI Color Correction

> ⚠️ Originally specified as Claude Haiku (`@anthropic-ai/sdk`). Changed to OpenAI GPT-4o-mini (`openai`) during implementation.

- [x] 8.1 Install `openai` package
- [x] 8.2 Create `POST /api/ai-suggest` endpoint with full server logic:
  - Authenticate via Clerk
  - Enforce rate limit via `ai_rate_limits` upsert (reject HTTP 429 at 10/hour)
  - Check and lazy-reset Free user credits (UTC month boundary)
  - Compute `adjustColor` server-side (smallest lightness delta to AA)
  - Call OpenAI GPT-4o-mini with structured prompt
  - Validate each suggestion by recalculating ratio mathematically
  - Run algorithmic HSL fallback if all GPT suggestions fail
  - Return HTTP 422 if both GPT and fallback fail
  - Increment `ai_credits_used` for Free users
- [x] 8.3 Implement algorithmic HSL fallback function (lightness shift to reach AA threshold)
- [x] 8.4 Add AI trigger condition to contrast result component (show button when ratio < 4.5:1 small or < 3:1 large)
- [x] 8.5 Build "Suggest with AI" button UI with auth gate (Clerk modal for unauthenticated users)
- [x] 8.6 Build AI suggestion cards UI component (up to 3 cards: hex swatch, ratio, WCAG level, "Use this color" button)
- [x] 8.7 Implement AI error states in UI (timeout, rate limit, credits exhausted, no valid suggestions)
- [x] 8.8 Build upsell modal for Free users with 0 credits remaining
- [x] 8.9 Wire "Use this color" button to update checker and save check with `ai_assisted = true`

## 9. Saved Palettes

- [x] 9.1 Create `POST /api/palettes` endpoint — saves palette, enforces 10-palette Pro limit (HTTP 403 `palette_limit_reached`)
- [x] 9.2 Create `GET /api/palettes` endpoint — returns user's personal palettes
- [x] 9.3 Create `DELETE /api/palettes/[id]` endpoint — deletes palette if caller is owner (HTTP 403 otherwise)
- [x] 9.4 Build palette management UI (`_palette-manager.tsx`) — list, create, delete palettes; show upsell for Free users

## 10. UI Redesign (unplanned — shipped post-merge)

- [x] 10.1 Redesign layout with 2-column grid inspired by v0/coolors
- [x] 10.2 Add DM Sans/Mono typography and refined component styles
- [x] 10.3 Switch to asymmetric 1fr/2fr grid and use real logo in header
- [x] 10.4 Build tools panel (`_tools-panel.tsx`) with 5 tabs:
  - Color palette harmony generator (complementary, analogous, triadic, split-complementary)
  - Color history
  - Palette export
  - Daltonism (color blindness) simulation
  - RGB/HSL display
- [x] 10.5 Add RGB/HSL display to color inputs
- [x] 10.6 Implement color history list in checker
- [x] 10.7 Implement daltonism simulation (protanopia, deuteranopia, tritanopia, achromatopsia)
- [x] 10.8 Add palette export functionality

## 11. Team Collaboration (Phase 3)

- [ ] 11.1 Create `POST /api/teams` endpoint — creates team, inserts owner into `team_members`, requires Teams plan
- [ ] 11.2 Create `POST /api/teams/[id]/invite` endpoint — adds member, enforces 5-user cap (HTTP 403 `team_member_limit_reached`)
- [ ] 11.3 Build team creation and invitation UI
- [ ] 11.4 Build shared brand palettes UI — list and manage team-level palettes (Teams only)
- [ ] 11.5 Implement frozen team read-only enforcement — block write operations on frozen teams (HTTP 403 `team_frozen`)
- [ ] 11.6 Implement 30-day deletion job for frozen teams (scheduled via Vercel cron or Neon background job)

## 12. Bulk Checker (Phase 3)

- [ ] 12.1 Build CSV upload component — accepts file, parses `text_color,bg_color` rows, handles invalid hex gracefully
- [ ] 12.2 Implement client-side bulk contrast calculation for all rows using existing `contrastRatio` utility
- [ ] 12.3 Build bulk results table UI — paginated at 50 rows, color swatches, ratio, WCAG level badges (color-coded pass/fail)
- [ ] 12.4 Gate bulk checker behind Teams plan with upsell prompt for Free/Pro users

## 13. PDF Reports (Phase 3)

- [ ] 13.1 Install `jspdf` and `jspdf-autotable` for client-side PDF generation
- [ ] 13.2 Implement PDF export function — generates report with title, date, summary stats, and results table
- [ ] 13.3 Add "Export PDF" button to check history view (Teams only — upsell otherwise)
- [ ] 13.4 Add "Export PDF" button to bulk checker results view (Teams only)

## 14. AI Palette Generation V2 (Phase 3)

- [ ] 14.1 Design prompt for full accessible palette generation from a single brand color (primary, secondary, backgrounds, text, states — all with WCAG ratios)
- [ ] 14.2 Create `POST /api/ai-palette` endpoint using OpenAI GPT-4o-mini
- [ ] 14.3 Build palette generation UI — input brand color, display generated palette with ratio annotations
- [ ] 14.4 Allow saving generated palette directly to team brand palettes
