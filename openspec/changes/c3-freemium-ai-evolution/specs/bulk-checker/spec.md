## ADDED Requirements

### Requirement: Teams users can upload a CSV of color pairs for batch WCAG checking
The system SHALL accept a CSV file upload containing rows of `text_color,bg_color` hex pairs (with or without `#` prefix). The system SHALL calculate the contrast ratio and WCAG AA/AAA levels for each pair and return the results as a structured list.

#### Scenario: Teams user uploads a valid CSV
- **WHEN** a Teams user uploads a CSV file with valid hex color pairs
- **THEN** the system SHALL return a results array where each entry contains `text_color`, `bg_color`, `ratio`, `small_text_level`, and `large_text_level`

#### Scenario: CSV contains an invalid hex value
- **WHEN** a row in the CSV contains an invalid hex value (not 3 or 6 hex characters)
- **THEN** the system SHALL include that row in the results with `error: "invalid_hex"` and continue processing remaining rows

#### Scenario: Non-Teams user attempts bulk check
- **WHEN** a Free or Pro user accesses the bulk checker
- **THEN** the system SHALL display an upsell prompt indicating Teams plan is required
- **AND** no file processing SHALL occur

### Requirement: Bulk check results are displayed in a paginated table
The bulk checker UI SHALL display results in a table with columns for text color (with swatch), background color (with swatch), ratio, small text WCAG level (color-coded), and large text WCAG level (color-coded). Results SHALL be paginated at 50 rows per page.

#### Scenario: Results contain more than 50 rows
- **WHEN** a bulk check returns more than 50 results
- **THEN** the UI SHALL display the first 50 rows and provide pagination controls to view subsequent pages
