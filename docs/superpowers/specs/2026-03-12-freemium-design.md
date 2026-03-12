# C3 — Freemium & AI-First Product Design

**Date:** 2026-03-12
**Project:** Color Contrast Checker (c3.eduardoalvarez.dev)
**Status:** Approved

---

## Overview

C3 evolves from a free single-page contrast checker into a freemium SaaS product centered around an AI-powered color correction feature. The core checker remains free forever (SEO engine and top-of-funnel), while AI suggestions, history, and team collaboration are gated behind paid tiers.

**Target audience:** Designers (UI/UX) and frontend developers — product teams that need accessible color systems.

**Core value proposition:** The only contrast checker that doesn't just tell you your colors fail — it fixes them for you.

---

## Product Tiers

### Free — $0/forever
- Contrast ratio checker (existing functionality)
- WCAG AA/AAA results for small and large text
- Color picker
- Live text preview
- **3 AI suggestions/month** — requires login; tracked per authenticated user account (anonymous users must log in to access AI)
- Shareable URLs for authenticated free users only (7-day expiry); anonymous users cannot generate shareable URLs

### Pro — $9/month or $80/year
- Everything in Free
- **Unlimited AI color correction suggestions**
- Check history (90 days)
- Permanent shareable URLs
- Saved palettes (up to 10; enforced server-side on `POST /api/palettes` — returns HTTP 403 with `"error": "palette_limit_reached"` when exceeded)
- Export PNG of results

### Teams — $29/month (up to 5 users)
- Everything in Pro
- **Shared brand palettes** (team-level color tokens)
- Up to 5 users with roles (owner/member); the owner counts toward the 5-user cap; owner is automatically inserted into `team_members` with role `owner` on team creation; adding a 6th member returns HTTP 403 with `"error": "team_member_limit_reached"` and an upsell prompt — no additional seats in V1
- Check history (1 year)
- Unlimited saved palettes
- **PDF export / WCAG audit reports**
- **Bulk checker** (CSV input of color pairs)
- **AI: full accessible palette generation** (V2 AI feature)

**Teams downgrade behavior:** When a team downgrades to Pro, team data (shared palettes, member access) is frozen (read-only) for 30 days, then deleted if not upgraded again. Team members revert to individual Pro accounts. Check history is not hard-deleted — history queries add a `WHERE created_at >= (downgrade_date - INTERVAL '90 days')` filter server-side so checks older than 90 days from downgrade become inaccessible without being removed from the DB.

---

## Architecture

### Existing stack (unchanged)
- Astro 4 + React 18 + TypeScript
- Tailwind CSS + nanostores
- Deployed on Vercel/Netlify

### New services added
| Service | Purpose | Cost |
|---|---|---|
| **Clerk** | Auth — Google/GitHub OAuth, magic link, UI components | Free (up to 10K MAU) |
| **Neon** | Serverless Postgres — users, checks, palettes, teams | Free (up to 512MB) |
| **Anthropic Claude API** | AI color correction suggestions | ~$0.001/request (claude-haiku-4-5-20251001) |
| **Stripe** | Subscriptions Pro + Teams, billing portal, webhooks | 2.9% + $0.30/transaction |

### Astro SSR mode
Astro switches to SSR (server-side rendering) mode to support:

| Endpoint | Description |
|---|---|
| `POST /api/checks` | Save a check and optionally generate a share token (authenticated Free+) |
| `GET /api/checks` | Check history (authenticated, filtered by plan limit) |
| `GET /api/checks/[token]` | Shareable check lookup (public); HTTP 410 if expired, HTTP 404 if not found |
| `POST /api/ai-suggest` | AI color correction |
| `POST /api/stripe/webhook` | Stripe event handler |
| `POST /api/palettes` | Save palette (authenticated, enforces tier limits) |
| `GET /api/palettes` | List user's palettes (authenticated) |
| `DELETE /api/palettes/[id]` | Delete palette (authenticated, owner only) |
| `POST /api/teams` | Create a team (Phase 3, Teams plan) |
| `POST /api/teams/[id]/invite` | Invite a member (Phase 3; HTTP 403 at 5-member cap) |

### Stripe webhook events handled
| Stripe event | Action |
|---|---|
| `customer.subscription.created` | Set `users.plan` to `pro` or `teams` |
| `customer.subscription.updated` | Update `users.plan`; if downgrade from `teams` → `pro`, freeze team and set `teams.frozen_at` |
| `customer.subscription.deleted` | Set `users.plan` to `free`; freeze team if applicable |
| `invoice.payment_failed` | Send Stripe email (default); no immediate plan change |

### AI rate limiting
Rate limiting (10 AI calls/hour per authenticated user) is enforced via a Neon DB table — no Redis required:

```sql
ai_rate_limits (
  user_id    uuid REFERENCES users(id),
  window_start timestamptz NOT NULL,  -- truncated to the hour (UTC)
  call_count   int DEFAULT 1,
  PRIMARY KEY (user_id, window_start)
)
```
On each AI request, upsert a row for `(user_id, date_trunc('hour', now() AT TIME ZONE 'UTC'))`. If `call_count >= 10`, reject with HTTP 429.

---

## Database Schema (Neon/Postgres)

```sql
-- Users (synced from Clerk via webhook)
users (
  id                  uuid PRIMARY KEY,
  clerk_id            text UNIQUE NOT NULL,
  email               text NOT NULL,
  plan                text DEFAULT 'free',  -- 'free' | 'pro' | 'teams'
  ai_credits_used     int DEFAULT 0,
  ai_credits_reset_at timestamptz,          -- UTC; set to first day of next month (UTC) on first AI use
  created_at          timestamptz DEFAULT now()
)

-- Contrast checks
checks (
  id               uuid PRIMARY KEY,
  user_id          uuid REFERENCES users(id),  -- null for anonymous (no history saved)
  text_color       text NOT NULL,   -- hex without #
  bg_color         text NOT NULL,   -- hex without #
  ratio            numeric(5,2) NOT NULL,
  text_type        text NOT NULL DEFAULT 'small',  -- 'small' | 'large'
  wcag_level       text,            -- 'AAA' | 'AA' | 'A' | 'fail' — derived and stored on save
  ai_assisted      boolean DEFAULT false,
  share_token      text UNIQUE,
  share_expires_at timestamptz,     -- null = permanent (Pro+); 7 days (UTC) for authenticated Free
  created_at       timestamptz DEFAULT now()
)

-- Saved palettes
palettes (
  id          uuid PRIMARY KEY,
  user_id     uuid REFERENCES users(id),
  team_id     uuid REFERENCES teams(id),
  name        text NOT NULL,
  colors      jsonb NOT NULL,  -- [{name, hex, role}]
  created_at  timestamptz DEFAULT now(),
  -- exactly one of user_id or team_id must be set
  CONSTRAINT palettes_single_owner CHECK (
    (user_id IS NOT NULL AND team_id IS NULL) OR
    (user_id IS NULL AND team_id IS NOT NULL)
  )
)

-- Teams
teams (
  id              uuid PRIMARY KEY,
  name            text NOT NULL,
  owner_id        uuid REFERENCES users(id),
  stripe_sub_id   text UNIQUE,
  status          text DEFAULT 'active',  -- 'active' | 'frozen' | 'deleted'
  frozen_at       timestamptz,
  created_at      timestamptz DEFAULT now()
)

-- Team members (owner is included; cap of 5 enforced server-side)
team_members (
  team_id   uuid REFERENCES teams(id),
  user_id   uuid REFERENCES users(id),
  role      text DEFAULT 'member',  -- 'owner' | 'member'
  PRIMARY KEY (team_id, user_id)
)

-- AI rate limiting (per user, per UTC hour)
ai_rate_limits (
  user_id      uuid REFERENCES users(id),
  window_start timestamptz NOT NULL,
  call_count   int DEFAULT 1,
  PRIMARY KEY (user_id, window_start)
)
```

---

## AI Feature Spec: Color Correction

### AI trigger conditions
The "Suggest with AI" button appears when **either** of the following fail:
- **Small text:** ratio < 4.5:1 (WCAG AA threshold)
- **Large text:** ratio < 3:1 (WCAG AA threshold for large text / bold 14pt+)

The button is hidden when the ratio passes both thresholds. The prompt sent to Claude includes the text type context so suggestions target the correct standard.

### Shareable URL page (`/share/[token]`)
Renders a **read-only result card** pre-populated with the saved check's `text_color`, `bg_color`, `ratio`, `wcag_level`, and `text_type`. It does not render a full interactive checker. A "Try it yourself" button links to the main checker with the colors pre-filled via URL query params (`/?text=RRGGBB&bg=RRGGBB`).

### User flow
1. User enters two colors that fail WCAG (per trigger conditions above)
2. "Suggest with AI" button appears below the result panel
3. **Auth gate:** if not logged in → Clerk login modal (required to use AI feature)
4. **Credits gate:** if Free user with 0 credits remaining → upsell modal to Pro
5. Loading state (~1-2 seconds)
6. Three suggestion cards appear, each showing:
   - Color preview swatch
   - Corrected hex value
   - New contrast ratio (recalculated mathematically server-side)
   - WCAG level achieved (`AA` or `AAA`; `balanced` is never shown in the UI — it renders as `AA`)
   - "Use this color" button
7. Clicking "Use" → applies color to checker; calls `POST /api/checks` with `ai_assisted: true` to save to history

### API endpoint: `POST /api/ai-suggest`

**Request:**
```json
{
  "textColor": "FF6B6B",
  "bgColor": "FFFFFF",
  "textType": "small"
}
```

`adjustColor` (which color to fix) is determined entirely server-side: whichever color requires the smaller lightness delta to reach the AA threshold. Clients do not send this field.

**Server logic:**
1. Authenticate request via Clerk session (required — anonymous users cannot use AI)
2. Enforce AI rate limit: upsert `ai_rate_limits` for current UTC hour; reject HTTP 429 if `call_count >= 10`
3. Check user plan and AI credits remaining; reject HTTP 403 if depleted
4. Lazy-reset credits if `now() AT TIME ZONE 'UTC' > ai_credits_reset_at`: set `ai_credits_used = 0`, update `ai_credits_reset_at` to `date_trunc('month', now() AT TIME ZONE 'UTC') + INTERVAL '1 month'`
5. Compute current ratio and determine `adjustColor` server-side
6. Call Claude with structured prompt
7. **Validate each suggestion** using server-side rules (see below); discard failures
8. If 0 valid suggestions from Claude → run algorithmic fallback (HSL lightness shift); if fallback also yields 0 valid suggestions → return error
9. Decrement `ai_credits_used` for Free users
10. Return validated suggestions (1–3 cards)

**Claude prompt template:**
```
Given {adjustColor} color #{colorToAdjust} on {otherSide} #{otherColor} with a
contrast ratio of {ratio}:1 (fails WCAG AA which requires {threshold}:1 for
{textType} text), suggest 3 adjusted versions of the {adjustColor} color:
- Suggestion 1: meets AA (ratio >= {threshold}:1)
- Suggestion 2: meets AAA (ratio >= {AAAthreshold}:1)
- Suggestion 3: any ratio >= {threshold}:1, your best balanced pick

Requirements:
- Preserve the original hue and vibe of #{colorToAdjust}
- Adjust lightness/saturation minimally
- Return ONLY valid JSON: [{"hex": "RRGGBB", "target": "AA|AAA|balanced"}]
- No # prefix in hex values
```

**Server-side validation rules:**
- `AA`: computed ratio >= AA threshold (4.5 for small, 3.0 for large)
- `AAA`: computed ratio >= AAA threshold (7.0 for small, 4.5 for large)
- `balanced`: computed ratio >= AA threshold (same rule as AA; displayed as "AA" in UI)

**Model:** `claude-haiku-4-5-20251001` — fastest and cheapest, ~$0.001/request

**Response:**
```json
{
  "suggestions": [
    { "hex": "D94F4F", "ratio": 4.6, "level": "AA" },
    { "hex": "B83232", "ratio": 7.1, "level": "AAA" },
    { "hex": "C44040", "ratio": 5.8, "level": "AA" }
  ]
}
```

### AI credits for Free users
- **Anonymous:** cannot access AI — Clerk login modal shown; no cookie tracking
- **Authenticated Free:** 3 credits/month tracked in `users.ai_credits_used`; lazy UTC reset on each AI request (see server logic step 4)
- **Pro/Teams:** unlimited; `ai_credits_used` not checked or incremented

### Guardrails
| Protection | Detail |
|---|---|
| Rate limiting | Max 10 AI calls/UTC-hour per authenticated user; enforced via `ai_rate_limits` table |
| Double validation | Ratio recalculated server-side after every suggestion; suggestions failing validation are discarded |
| Algorithmic fallback | Claude fails or returns malformed JSON → HSL lightness shift fallback; if fallback also fails → error state |
| Credit system | Free: 3/month UTC-based lazy reset; Pro/Teams: unlimited |

### AI error states (UI)
| Scenario | User-facing message |
|---|---|
| Claude returns malformed JSON | Algorithmic fallback runs silently; subtle note: "Showing algorithmically generated suggestions" |
| Partial Claude results (1–2 valid) | Show however many valid suggestions exist (1–3); no error message |
| All Claude suggestions fail + fallback succeeds | Fallback results shown with subtle note |
| All Claude suggestions fail + fallback fails | "Couldn't generate a valid suggestion for these colors. The contrast difference may be too extreme to adjust automatically." — no retry |
| Network timeout (> 5s) | "Suggestion timed out. Please try again." with retry button |
| Rate limit hit (10/hour) | "You've made too many requests. Please wait before trying again." |
| Credits depleted (Free) | Upsell modal: "You've used your 3 free AI suggestions this month. Upgrade to Pro for unlimited suggestions." |

---

## Implementation Roadmap

### Phase 1 — Foundation (2-3 weeks)
*Goal: platform ready to accept payments*

- [ ] Fix bug: `src/pages/sections/_form.tsx:42` — `handleSetValue('text')` → `handleSetValue('background')`
- [ ] Fix typo: footer "Color Contras Checker" → "Color Contrast Checker"
- [ ] Fix `landing.layout.astro`: remove duplicate `<meta name="title">` (lines 15 and 17); fix `<link rel="icon">` missing leading slash (line 13); add `<meta name="description">`
- [ ] Switch Astro to SSR mode (`output: 'server'`)
- [ ] Integrate Clerk — Google/GitHub OAuth + magic link
- [ ] Set up Neon DB — run schema migrations (all tables including `ai_rate_limits`)
- [ ] Build `POST /api/checks` — save check + optional share token generation
- [ ] Build `GET /api/checks` — authenticated check history (filtered by plan limits)
- [ ] Build check history UI (authenticated users only)
- [ ] Build `/share/[token]` — read-only result card with "Try it yourself" link
- [ ] Wire auth gate: show Clerk login modal for gated features
- [ ] Integrate Stripe — Pro and Teams subscriptions
- [ ] Build `POST /api/stripe/webhook` handler (all 4 events listed above)
- [ ] Build upgrade/billing UI (Stripe Customer Portal)

### Phase 2 — AI Feature (1-2 weeks)
*Goal: ship the differentiating feature*

- [ ] Build `POST /api/ai-suggest` endpoint with double validation, rate limiting, and algorithmic fallback
- [ ] Build AI suggestion cards UI (1–3 cards, all error states)
- [ ] Implement AI trigger condition (small text < 4.5:1, large text < 3:1)
- [ ] Implement credit system (Free: 3/month, lazy UTC reset)
- [ ] Build contextual upsell modal (credits = 0)
- [ ] Add "Suggest with AI" button to contrast result section
- [ ] Wire auth gate to AI button

### Phase 3 — Teams (3-4 weeks)
*Goal: higher average contract value*

- [ ] `POST /api/teams` — create team, auto-insert owner into `team_members`
- [ ] `POST /api/teams/[id]/invite` — invite member (enforces 5-user cap including owner)
- [ ] Shared brand palettes UI
- [ ] Bulk checker (CSV upload → batch results)
- [ ] PDF report generation (WCAG audit export)
- [ ] AI V2: full accessible palette generation from a single brand color

---

## Known Bugs to Fix Before Launch

1. **`src/pages/sections/_form.tsx:42`** — background field calls `handleSetValue('text')` instead of `handleSetValue('background')`
2. **`src/layouts/components/footer.astro`** — "Color Contras Checker" missing the "t"
3. **`src/layouts/landing.layout.astro`** — duplicate `<meta name="title">` (lines 15 and 17); second `<link rel="icon">` (line 13) missing leading slash (`images/favicon.svg` → `/images/favicon.svg`); missing `<meta name="description">`

---

## Competitive Differentiation

| Feature | C3 (this design) | WebAIM | Coolors | Accessible Palette |
|---|---|---|---|---|
| Basic checker | ✅ Free | ✅ Free | ✅ Free | ✅ Free |
| AI color correction | ✅ Pro | ❌ | ❌ | ❌ |
| Check history | ✅ Pro | ❌ | ❌ | ❌ |
| Team palettes | ✅ Teams | ❌ | 💰 | ❌ |
| PDF reports | ✅ Teams | ❌ | ❌ | ❌ |
| Bulk checker | ✅ Teams | ❌ | ❌ | ❌ |

The AI correction is the moat — no major accessibility tool offers automatic WCAG-compliant color adjustment.
