## ADDED Requirements

### Requirement: Teams users can export a WCAG audit report as a PDF
The system SHALL allow Teams users to export a PDF report from their check history or bulk checker results. The PDF SHALL include: report title, generation date, a summary (total checks, pass/fail counts), and a table of results with color swatches, ratios, and WCAG levels per row.

#### Scenario: Teams user exports PDF from history
- **WHEN** a Teams user clicks "Export PDF" on their check history view
- **THEN** the browser SHALL download a PDF file named `c3-wcag-report-{YYYY-MM-DD}.pdf`
- **AND** the PDF SHALL contain all checks within the selected date range

#### Scenario: Teams user exports PDF from bulk checker results
- **WHEN** a Teams user completes a bulk check and clicks "Export PDF"
- **THEN** the browser SHALL download a PDF containing all bulk check results in the same format

#### Scenario: Non-Teams user attempts PDF export
- **WHEN** a Free or Pro user attempts to export a PDF
- **THEN** the system SHALL display an upsell prompt indicating Teams plan is required
- **AND** no PDF SHALL be generated

### Requirement: PDF generation is performed client-side
PDF reports SHALL be generated in the browser using a client-side library (e.g., jsPDF). No server-side PDF rendering endpoint is required. The client SHALL have access to all necessary data (check results) before initiating export.

#### Scenario: PDF export is triggered with results available
- **WHEN** a Teams user clicks "Export PDF" and result data is loaded in the UI
- **THEN** the PDF SHALL be generated and downloaded without any additional server request
