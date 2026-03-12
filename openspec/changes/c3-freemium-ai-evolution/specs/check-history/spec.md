## ADDED Requirements

### Requirement: Authenticated users can save and view check history
The system SHALL automatically save every contrast check performed by an authenticated user via `POST /api/checks`. History SHALL be retrievable via `GET /api/checks`, filtered by plan limits.

#### Scenario: Authenticated user performs a contrast check
- **WHEN** an authenticated user submits a color pair via the checker UI
- **THEN** the system SHALL save a row to `checks` with `user_id`, `text_color`, `bg_color`, `ratio`, `text_type`, `wcag_level`, and `ai_assisted = false`

#### Scenario: Pro user retrieves check history
- **WHEN** a Pro user calls `GET /api/checks`
- **THEN** the system SHALL return checks from the last 90 days, ordered by `created_at DESC`

#### Scenario: Teams user retrieves check history
- **WHEN** a Teams user calls `GET /api/checks`
- **THEN** the system SHALL return checks from the last 365 days, ordered by `created_at DESC`

#### Scenario: Free user attempts to view history
- **WHEN** a Free user navigates to check history
- **THEN** the system SHALL display an upsell prompt indicating that history requires a Pro subscription
- **AND** no history data SHALL be returned

### Requirement: Anonymous checks are not persisted
The system SHALL NOT save contrast checks for unauthenticated users. No cookies, local storage, or anonymous tracking SHALL be used for check persistence.

#### Scenario: Anonymous user performs a contrast check
- **WHEN** an unauthenticated user submits a color pair
- **THEN** the result SHALL be displayed normally in the UI
- **AND** no row SHALL be inserted into the `checks` table

### Requirement: Downgraded users see history filtered by new plan limits
When a Teams user downgrades to Pro, historical check rows SHALL be retained in the database but the `GET /api/checks` endpoint SHALL apply a `WHERE created_at >= (downgrade_date - INTERVAL '90 days')` filter. No rows SHALL be hard-deleted.

#### Scenario: User downgrades from Teams to Pro and views history
- **WHEN** a user who recently downgraded from Teams to Pro calls `GET /api/checks`
- **THEN** the system SHALL return only checks from within the last 90 days
- **AND** older checks SHALL remain in the database and become accessible again if the user re-upgrades
