## Context

C3 is currently a fully static Astro site with no backend, no auth, and no persistence. It calculates contrast ratios client-side and displays WCAG results. The existing codebase uses React islands for interactive components (form, preview, result) managed via nanostores. There is a legacy unused Supabase `.env` from a previous Next.js version.

The change introduces a server layer, a relational database, third-party auth, AI inference, and payment processing — all while keeping the existing checker UI intact as the free tier entry point.

**Implementation status (as of 2026-03-13):** Phases 1–9 are complete and deployed to Vercel. Phases 10–13 (team collaboration, bulk checker, PDF reports, AI palette V2) are pending Phase 3. Key provider changes made during implementation: billing migrated from Stripe to Lemon Squeezy; AI migrated from Claude Haiku to OpenAI GPT-4o-mini. Major UI redesign shipped post-merge (asymmetric grid, tools panel, daltonism simulation).

## Goals / Non-Goals

**Goals:**
- Introduce a freemium model with three tiers (Free, Pro, Teams) gated by Clerk auth and Stripe subscriptions
- Ship an AI color correction feature as the core differentiator using Claude Haiku
- Add persistent check history, saved palettes, and shareable URLs
- Keep the core checker fully functional without login (free forever)
- Use only services with generous free tiers (Neon, Clerk) to minimize operating costs at early stage
- Fix three known bugs before new feature work begins

**Non-Goals:**
- Mobile app or browser extension (web only)
- Self-hosted deployment path
- Real-time collaboration (Teams shares palettes, not live editing)
- AI analysis of screenshots or uploaded images (V2+ scope)
- SSO / SAML for enterprise (not in V1 Teams)
- Custom domain per team

## Decisions

### D1: Clerk over custom auth or Auth.js

**Decision:** Use Clerk for authentication.

**Rationale:** Clerk provides pre-built React components (sign-in modal, user button) that require near-zero UI work, supports Google/GitHub OAuth and magic link out of the box, and integrates natively with Astro SSR via `@clerk/astro`. Building custom auth or using Auth.js would require substantially more setup for the same outcome. Clerk's free tier (10K MAU) covers the entire early growth phase.

**Alternative considered:** Supabase Auth — rejected because the existing Supabase project was abandoned and re-activating it adds vendor lock-in to a service the project already moved away from.

### D2: Neon over PlanetScale, Turso, or Firebase

**Decision:** Use Neon (serverless Postgres) as the database.

**Rationale:** Neon provides real Postgres with full SQL, joins, and constraints — making the schema from the brainstorm directly usable. It has a generous free tier (512MB) and a Node.js driver compatible with Astro's server environment. The existing schema design (foreign keys, CHECK constraints, CTEs for history filtering) requires relational semantics that NoSQL (Firebase Firestore) cannot express cleanly.

**Alternative considered:** Firebase — rejected due to NoSQL requiring a full schema redesign and Google vendor lock-in. Turso (SQLite) — rejected due to limited ecosystem and no branching on free tier.

### D3: Astro API Routes over a separate backend

**Decision:** Use Astro's built-in SSR API routes for all server-side logic.

**Rationale:** Adding a separate Express/Fastify backend would require a second deployment, cross-origin configuration, and additional complexity. Astro in SSR mode (`output: 'server'`) supports server-only API routes at `/api/*` with full access to Node.js APIs. All required endpoints (AI, Stripe webhooks, auth-gated history) fit comfortably in Astro's route model.

**Alternative considered:** Separate Node.js API on Railway/Render — rejected because it adds deployment complexity and cost with no benefit at this scale.

### D4: OpenAI GPT-4o-mini for AI suggestions

**Decision:** Use `gpt-4o-mini` (OpenAI) for the AI color correction endpoint.

**Rationale:** Originally specified as Claude Haiku (`claude-haiku-4-5-20251001`), but changed to OpenAI GPT-4o-mini during implementation. GPT-4o-mini is comparable in speed and cost to Haiku (~$0.001/request), supports structured JSON output natively, and the task (suggest 3 color hex values with constraints) is simple enough that capability differences between models are negligible.

**Critical safeguard:** OpenAI's output is never trusted directly. The server recalculates the contrast ratio for every suggested hex value mathematically. Suggestions that don't meet their stated WCAG target are discarded. If all suggestions fail, an algorithmic HSL-based fallback runs instead. This means the feature works even when the model returns wrong values or is unavailable.

**Alternative considered:** Claude Haiku — originally specified but replaced in favor of OpenAI's ecosystem to consolidate with the existing OpenAI SDK dependency.

### D4b: Lemon Squeezy over Stripe for billing

**Decision:** Use Lemon Squeezy as the payment processor.

**Rationale:** Originally specified as Stripe, but replaced during implementation. Lemon Squeezy acts as a Merchant of Record (handles VAT/taxes automatically), has a simpler API surface for checkout sessions and webhooks, and reduces compliance overhead at early stage. The migration required a new DB column (`lemonsqueezy_customer_id`, `lemonsqueezy_subscription_id`) in place of `stripe_customer_id`, reflected in migration `007_users_lemonsqueezy.sql`.

**Alternative considered:** Stripe — originally specified but replaced due to Lemon Squeezy's simpler onboarding and built-in tax handling.

### D5: Lazy credit reset over a cron job

**Decision:** Reset Free user AI credits lazily on each request rather than via a scheduled job.

**Rationale:** Vercel/Netlify deployments don't natively support cron jobs without additional paid services. A lazy reset — checking `now() AT TIME ZONE 'UTC' > ai_credits_reset_at` on each AI request and updating the counter if true — is equally correct, requires no infrastructure, and is simpler to reason about. All timestamps are UTC to avoid timezone boundary issues.

### D6: Rate limiting via Postgres table over Redis

**Decision:** Store AI rate limit state in a Neon table (`ai_rate_limits`) rather than Redis.

**Rationale:** At early-stage traffic, a Postgres upsert per UTC hour per user is fast enough and avoids adding another service dependency. The table approach also persists across serverless function cold starts, which an in-memory solution would not. If traffic scales to where DB-based rate limiting becomes a bottleneck, migrating to Upstash Redis is a one-file change.

### D7: Astro v5 + Vercel adapter over Astro v6 + Node adapter

**Decision:** Deploy on Astro v5 with `@astrojs/vercel` adapter.

**Originally specified:** `@astrojs/node` adapter with Astro v6.

**Rationale:** Astro v6 produced a `before-hydration` 404 error in Vercel's build pipeline (incompatibility with Vercel adapter v10 and Node 22). Downgrading to Astro v5 + Vercel adapter v8 resolved the issue. Added `.npmrc` with `legacy-peer-deps` for peer dependency resolution on Vercel CI. Static asset paths were explicitly set to `_astro` to fix static file 404s.

## Risks / Trade-offs

**[Risk] Neon free tier connection limits under serverless concurrency**
→ Mitigation: Use `@neondatabase/serverless` HTTP driver (no persistent connections) instead of `pg`. Each Astro API route uses a short-lived HTTP request to Neon.

**[Risk] Stripe webhook replay / duplicate processing**
→ Mitigation: Check `stripe_sub_id` uniqueness before writing plan changes. Use Stripe's idempotency guarantees. Log all webhook events for auditability.

**[Risk] Claude returns invalid hex values or JSON**
→ Mitigation: Server validates every hex with the existing `hexValidator` utility before calculating ratio. If JSON parse fails, the algorithmic fallback runs immediately.

**[Risk] Cold start latency on Vercel/Netlify SSR functions**
→ Mitigation: The static checker UI is served from CDN (no cold start). Only AI and auth endpoints are SSR. Cold starts add ~200-500ms; the AI endpoint already shows a loading state for 1-2s so this is imperceptible.

**[Risk] Teams downgrade data loss confusion**
→ Mitigation: Downgrade freezes team data for 30 days (read-only). History beyond 90 days is filtered server-side — no rows are deleted. Users can re-upgrade and regain full access.

## Migration Plan

1. **Bug fixes first** — fix the three known bugs in a separate PR before any new feature work. This ensures the baseline is correct.
2. **SSR migration** — add Astro SSR adapter. Verify existing static pages still render correctly. No user-visible change.
3. **Schema migration** — run Neon migrations. No app changes yet.
4. **Clerk integration** — add auth UI (login modal, user button in header). Existing checker works without login. No breaking change.
5. **Stripe + billing** — add upgrade UI and webhook handler. Pricing page goes live.
6. **History + sharing** — gated features now accessible to authenticated users.
7. **AI feature** — ship `POST /api/ai-suggest`. Free users see the 3-credit limit immediately.
8. **Teams** — Phase 3, separate deployment.

**Rollback:** Each phase is independently deployable. Removing a feature flag or reverting an API route is sufficient rollback for any phase.

## Open Questions

- Should the `/share/[token]` page render as a full interactive checker or a read-only card? *(Decision: read-only card with "Try it yourself" link — simpler and avoids anonymous users bypassing auth gate via shared links)* ✅
- Should PNG export be client-side (html2canvas) or server-side? *(Decision: client-side — no server dependency, sufficient quality for the use case)* ✅
- Should anonymous (unauthenticated) checks ever be saved? *(Decision: no — checks are only persisted for authenticated users)* ✅
- Should billing use Stripe or Lemon Squeezy? *(Decision: Lemon Squeezy — simpler MoR model, built-in tax handling, easier early-stage onboarding)* ✅
- Should AI use Claude Haiku or OpenAI GPT-4o-mini? *(Decision: OpenAI GPT-4o-mini — consolidated dependency, native JSON output, comparable cost/latency)* ✅
