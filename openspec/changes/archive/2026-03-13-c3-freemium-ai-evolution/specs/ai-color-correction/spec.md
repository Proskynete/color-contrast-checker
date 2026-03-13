## ADDED Requirements

### Requirement: AI suggestion button appears when colors fail WCAG
The system SHALL display a "Suggest with AI" button below the contrast result panel when the calculated ratio fails WCAG AA thresholds: ratio < 4.5:1 for small text, or ratio < 3:1 for large text. The button SHALL be hidden when the ratio passes both thresholds.

#### Scenario: Colors fail small text AA threshold
- **WHEN** the contrast ratio is less than 4.5:1
- **THEN** the "Suggest with AI" button SHALL appear below the result panel

#### Scenario: Colors pass all thresholds
- **WHEN** the contrast ratio is 4.5:1 or higher
- **THEN** the "Suggest with AI" button SHALL NOT be displayed

### Requirement: AI suggestions require authentication
Clicking "Suggest with AI" SHALL require the user to be authenticated. Unauthenticated users SHALL see the Clerk sign-in modal.

#### Scenario: Unauthenticated user clicks "Suggest with AI"
- **WHEN** an unauthenticated user clicks the "Suggest with AI" button
- **THEN** the Clerk sign-in modal SHALL appear
- **AND** no API call SHALL be made until the user is authenticated

### Requirement: POST /api/ai-suggest returns up to 3 WCAG-compliant color suggestions
The endpoint SHALL accept `{ textColor, bgColor, textType }`, determine server-side which color to adjust (smallest lightness delta to AA), call Claude Haiku, validate each suggestion by recalculating the contrast ratio mathematically, and return 1–3 validated suggestions. Each suggestion SHALL include `hex`, `ratio`, and `level` (`AA` or `AAA`).

#### Scenario: Valid request returns suggestions
- **WHEN** `POST /api/ai-suggest` is called with a failing color pair by an authenticated user with credits
- **THEN** the server SHALL compute `adjustColor` server-side, call Claude Haiku, validate all suggestions, and return a JSON array with 1–3 entries of `{ hex, ratio, level }`

#### Scenario: All Claude suggestions fail server-side validation
- **WHEN** Claude returns suggestions that do not meet their stated WCAG targets upon server-side recalculation
- **THEN** the system SHALL run the algorithmic HSL fallback
- **AND** return fallback suggestions with a `source: "fallback"` flag in the response

#### Scenario: Both Claude and algorithmic fallback fail
- **WHEN** neither Claude nor the HSL fallback can produce a valid suggestion
- **THEN** the endpoint SHALL return HTTP 422 with `{ error: "no_valid_suggestions" }`
- **AND** the UI SHALL display: "Couldn't generate a valid suggestion for these colors."

### Requirement: Free users are limited to 3 AI suggestions per calendar month (UTC)
The system SHALL track `ai_credits_used` per user. On each AI request, if `now() AT TIME ZONE 'UTC' > ai_credits_reset_at`, the server SHALL reset `ai_credits_used = 0` and set `ai_credits_reset_at` to the first day of the following UTC month before checking the limit. Pro and Teams users SHALL have no credit limit.

#### Scenario: Free user has remaining credits
- **WHEN** a Free user with `ai_credits_used < 3` calls `POST /api/ai-suggest`
- **THEN** the request SHALL proceed and `ai_credits_used` SHALL be incremented by 1

#### Scenario: Free user exhausts credits
- **WHEN** a Free user with `ai_credits_used = 3` calls `POST /api/ai-suggest`
- **THEN** the system SHALL return HTTP 403 with `{ error: "credits_exhausted" }`
- **AND** the UI SHALL display an upsell modal prompting upgrade to Pro

#### Scenario: Free user's credits reset at month boundary
- **WHEN** a Free user makes a request and `now() AT TIME ZONE 'UTC' > ai_credits_reset_at`
- **THEN** the server SHALL reset `ai_credits_used = 0` before processing the request
- **AND** the request SHALL succeed as if it were a fresh month

### Requirement: AI requests are rate-limited to 10 per UTC hour per user
The system SHALL enforce a maximum of 10 AI requests per authenticated user per UTC calendar hour, stored in the `ai_rate_limits` table. This limit SHALL apply to all plans including Pro and Teams.

#### Scenario: User exceeds hourly rate limit
- **WHEN** an authenticated user makes more than 10 calls to `POST /api/ai-suggest` within the same UTC hour
- **THEN** the 11th and subsequent requests SHALL return HTTP 429
- **AND** the UI SHALL display: "You've made too many requests. Please wait before trying again."

### Requirement: AI suggestion UI displays up to 3 suggestion cards
The UI SHALL render each validated suggestion as a card showing a color preview swatch, the corrected hex value, the new contrast ratio, the WCAG level (`AA` or `AAA`), and a "Use this color" button. Clicking "Use this color" SHALL apply the suggested color to the checker and save the check with `ai_assisted = true`.

#### Scenario: User applies an AI suggestion
- **WHEN** an authenticated user clicks "Use this color" on a suggestion card
- **THEN** the corresponding color field in the checker SHALL update to the suggested hex
- **AND** the check SHALL be saved to history with `ai_assisted = true`
