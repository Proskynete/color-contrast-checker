## ADDED Requirements

### Requirement: Teams plan users can create and manage a team
A Teams-plan user SHALL be able to create a team via `POST /api/teams`. The creator SHALL automatically be inserted into `team_members` with `role = 'owner'` and counts toward the 5-user cap. Teams SHALL have a `status` of `active`, `frozen`, or `deleted`.

#### Scenario: Teams user creates a team
- **WHEN** a Teams-plan user calls `POST /api/teams` with a team name
- **THEN** a team row SHALL be created with `status = 'active'` and `owner_id` set
- **AND** the creator SHALL be inserted into `team_members` with `role = 'owner'`

#### Scenario: Non-Teams user attempts to create a team
- **WHEN** a Free or Pro user calls `POST /api/teams`
- **THEN** the system SHALL return HTTP 403 with `{ error: "teams_plan_required" }`

### Requirement: Team owners can invite up to 4 additional members (5 total including owner)
`POST /api/teams/{id}/invite` SHALL add a user to the team. The total member count (including owner) SHALL not exceed 5. Attempting to add a 6th member SHALL be rejected.

#### Scenario: Owner invites a member within the cap
- **WHEN** a team owner calls `POST /api/teams/{id}/invite` with a valid email and the team has fewer than 5 members
- **THEN** the invited user SHALL be added to `team_members` with `role = 'member'`

#### Scenario: Owner attempts to add a 6th member
- **WHEN** a team owner calls `POST /api/teams/{id}/invite` and the team already has 5 members
- **THEN** the system SHALL return HTTP 403 with `{ error: "team_member_limit_reached" }`
- **AND** an upsell message SHALL be shown (no additional seats available in V1)

### Requirement: Frozen teams become read-only and are deleted after 30 days
When a team's subscription downgrades (Teams → Pro or cancellation), `teams.status` SHALL be set to `frozen` and `teams.frozen_at` SHALL be recorded. Frozen teams' data SHALL be read-only. After 30 days, the team and its associated data SHALL be marked `deleted`.

#### Scenario: Team data is accessed while frozen
- **WHEN** a user attempts to modify a frozen team's palettes or settings
- **THEN** the system SHALL return HTTP 403 with `{ error: "team_frozen" }`
- **AND** read operations (viewing shared palettes) SHALL still succeed

#### Scenario: Frozen team is not re-activated within 30 days
- **WHEN** 30 days pass after `teams.frozen_at` without re-upgrade
- **THEN** `teams.status` SHALL be set to `deleted` and team palettes SHALL be permanently removed

### Requirement: Team members revert to individual Pro plan on team deletion
When a team is deleted or frozen, all members (except the owner, who may have already downgraded) SHALL retain their individual Pro plan access. Team-specific data (shared palettes) becomes inaccessible but personal data is unaffected.

#### Scenario: Team is frozen and member accesses personal history
- **WHEN** a team member's team is frozen
- **THEN** the member SHALL retain Pro-level access to their personal check history and palettes
- **AND** the shared team palettes SHALL be read-only
