## ADDED Requirements

### Requirement: Three subscription tiers are available
The system SHALL offer Free (no cost), Pro ($9/month or $80/year), and Teams ($29/month, up to 5 users) tiers. Tier enforcement SHALL be based on `users.plan` updated via Stripe webhooks.

#### Scenario: User upgrades from Free to Pro
- **WHEN** a user completes a Stripe Checkout for the Pro plan
- **THEN** Stripe SHALL fire `customer.subscription.created`
- **AND** the webhook handler SHALL set `users.plan = 'pro'` for the corresponding user
- **AND** the user SHALL immediately gain access to Pro-tier features on next request

#### Scenario: User's subscription is cancelled
- **WHEN** Stripe fires `customer.subscription.deleted`
- **THEN** the system SHALL set `users.plan = 'free'`
- **AND** Pro/Teams features SHALL be inaccessible on next request

#### Scenario: User downgrades from Teams to Pro
- **WHEN** Stripe fires `customer.subscription.updated` with a plan change from Teams to Pro
- **THEN** the system SHALL set `users.plan = 'pro'`, set `teams.status = 'frozen'` and `teams.frozen_at = now()`
- **AND** team data SHALL become read-only for 30 days before deletion

### Requirement: Stripe Customer Portal is accessible for billing management
Authenticated users SHALL be able to manage their subscription (upgrade, downgrade, cancel, update payment method) via the Stripe Customer Portal without leaving C3.

#### Scenario: User opens billing portal
- **WHEN** an authenticated user navigates to account settings and clicks "Manage billing"
- **THEN** the system SHALL generate a Stripe Customer Portal session and redirect the user to it
- **AND** after completing portal actions, the user SHALL be redirected back to C3

### Requirement: Webhook events are handled idempotently
The `POST /api/stripe/webhook` endpoint SHALL handle `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, and `invoice.payment_failed` events. Processing SHALL be idempotent — re-delivering the same event MUST NOT produce duplicate state changes.

#### Scenario: Stripe delivers a duplicate webhook event
- **WHEN** the same Stripe event ID is received more than once
- **THEN** the system SHALL process only the first delivery and return HTTP 200 for subsequent deliveries without changing any data

#### Scenario: Payment fails
- **WHEN** Stripe fires `invoice.payment_failed`
- **THEN** the system SHALL NOT immediately downgrade the user's plan (Stripe handles retry logic)
- **AND** no application-level action is required beyond returning HTTP 200
