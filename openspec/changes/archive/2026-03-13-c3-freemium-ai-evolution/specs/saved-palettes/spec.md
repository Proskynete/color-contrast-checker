## ADDED Requirements

### Requirement: Pro users can save and manage personal palettes
Pro users SHALL be able to save named palettes of up to N colors via `POST /api/palettes`. Each palette SHALL belong to exactly one user (personal) or one team (shared), enforced via the `palettes_single_owner` CHECK constraint. Pro users are limited to 10 personal palettes.

#### Scenario: Pro user saves a new palette within the limit
- **WHEN** a Pro user calls `POST /api/palettes` with a name and color array and has fewer than 10 saved palettes
- **THEN** the system SHALL insert the palette and return the created record

#### Scenario: Pro user exceeds the 10-palette limit
- **WHEN** a Pro user calls `POST /api/palettes` and already has 10 saved palettes
- **THEN** the system SHALL return HTTP 403 with `{ error: "palette_limit_reached" }`

#### Scenario: User retrieves their palettes
- **WHEN** an authenticated user calls `GET /api/palettes`
- **THEN** the system SHALL return all palettes owned by that user (personal only, not team palettes)

#### Scenario: User deletes a palette
- **WHEN** an authenticated user calls `DELETE /api/palettes/{id}` for a palette they own
- **THEN** the system SHALL delete the palette and return HTTP 204

#### Scenario: User attempts to delete another user's palette
- **WHEN** an authenticated user calls `DELETE /api/palettes/{id}` for a palette they do not own
- **THEN** the system SHALL return HTTP 403

### Requirement: Palette rows must have exactly one owner
Every row in the `palettes` table SHALL have exactly one of `user_id` or `team_id` set (not both, not neither), enforced by the `palettes_single_owner` database CHECK constraint.

#### Scenario: Palette is created with both user_id and team_id set
- **WHEN** an insert is attempted with both `user_id` and `team_id` non-null
- **THEN** the database SHALL reject the insert with a constraint violation
