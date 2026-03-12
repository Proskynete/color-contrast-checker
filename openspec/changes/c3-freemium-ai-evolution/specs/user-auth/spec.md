## ADDED Requirements

### Requirement: User can sign in with OAuth or magic link
The system SHALL provide authentication via Google OAuth, GitHub OAuth, and email magic link, implemented through Clerk. The sign-in UI SHALL be rendered as a modal overlay using Clerk's pre-built components.

#### Scenario: Unauthenticated user accesses a gated feature
- **WHEN** an unauthenticated user clicks "Suggest with AI", attempts to view their history, or tries to generate a shareable URL
- **THEN** the system SHALL display the Clerk sign-in modal without navigating away from the current page

#### Scenario: User signs in successfully
- **WHEN** a user completes sign-in via any provider
- **THEN** the system SHALL create or retrieve the user record in the `users` table (synced via Clerk webhook), set the session cookie, and dismiss the modal
- **AND** the user SHALL be returned to their previous context with the gated action available

#### Scenario: User signs out
- **WHEN** a user clicks sign out from the user button in the header
- **THEN** the session SHALL be invalidated and the UI SHALL revert to the unauthenticated state
- **AND** the core contrast checker SHALL remain fully functional without login

### Requirement: Anonymous users retain full access to core checker
The core contrast checker (color input, ratio calculation, WCAG result display) SHALL function without any authentication. Authentication SHALL only be required for AI suggestions, check history, shareable URLs, and palette management.

#### Scenario: Anonymous user uses the checker
- **WHEN** a user who is not signed in enters two colors and views the contrast result
- **THEN** the system SHALL calculate and display the ratio and WCAG levels without prompting for login

### Requirement: User record is provisioned on first sign-in
The system SHALL automatically create a `users` row via Clerk webhook (`user.created` event) with `plan = 'free'` and `ai_credits_used = 0` when a new user authenticates for the first time.

#### Scenario: New user authenticates for the first time
- **WHEN** Clerk fires a `user.created` webhook
- **THEN** the system SHALL insert a row into `users` with `clerk_id`, `email`, `plan = 'free'`, `ai_credits_used = 0`
- **AND** the user SHALL be able to immediately access Free-tier gated features
