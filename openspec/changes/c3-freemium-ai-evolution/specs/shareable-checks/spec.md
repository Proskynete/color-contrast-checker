## ADDED Requirements

### Requirement: Authenticated users can generate shareable check URLs
`POST /api/checks` SHALL accept an optional `share: true` flag. When set, the system SHALL generate a unique `share_token` and set `share_expires_at` based on the user's plan (7 days for Free, null/permanent for Pro/Teams).

#### Scenario: Free user generates a shareable URL
- **WHEN** an authenticated Free user creates a check with `share: true`
- **THEN** the system SHALL generate a `share_token` and set `share_expires_at = now() + INTERVAL '7 days'` (UTC)
- **AND** the response SHALL include the shareable URL `/share/{token}`

#### Scenario: Pro user generates a shareable URL
- **WHEN** an authenticated Pro user creates a check with `share: true`
- **THEN** the system SHALL generate a `share_token` and set `share_expires_at = null` (permanent)
- **AND** the response SHALL include the shareable URL `/share/{token}`

#### Scenario: Anonymous user attempts to generate a shareable URL
- **WHEN** an unauthenticated user attempts to share a check
- **THEN** the system SHALL display the Clerk sign-in modal
- **AND** no share token SHALL be generated

### Requirement: Shared check page renders a read-only result card
The `/share/[token]` page SHALL render a read-only result card displaying the check's `text_color`, `bg_color`, `ratio`, `wcag_level`, and `text_type`. It SHALL include a "Try it yourself" button linking to `/?text={text_color}&bg={bg_color}` to pre-fill the checker.

#### Scenario: Visitor opens a valid shareable URL
- **WHEN** any user (authenticated or not) navigates to `/share/{valid_token}`
- **THEN** the system SHALL display the read-only result card with color previews, ratio, and WCAG level
- **AND** a "Try it yourself" button SHALL link to the checker with colors pre-filled

#### Scenario: Visitor opens an expired shareable URL
- **WHEN** a user navigates to `/share/{expired_token}` where `share_expires_at < now()`
- **THEN** the system SHALL return HTTP 410 Gone and display an "This link has expired" message

#### Scenario: Visitor opens a non-existent shareable URL
- **WHEN** a user navigates to `/share/{unknown_token}`
- **THEN** the system SHALL return HTTP 404 and display a "Check not found" message
