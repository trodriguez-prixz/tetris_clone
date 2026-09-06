# sidebar-controls-audio-clearance Specification

## Purpose

Keep the persistent Controls legend readable without colliding with sidebar audio status indicators.

## Requirements

### Requirement: Controls clear audio footer

The last Controls help line MUST sit above the music status indicator such that `controlsLastY + halfBodyFontPx + spacing.md ≤ musicY`. Sound status MUST remain below music. `SCORE_AREA_HEIGHT` and the full Controls line set MUST be preserved.

#### Scenario: Last Controls line clears music by spacing.md

- **GIVEN** the current Controls help line count and Stats panel height
- **WHEN** Controls last-line Y and music indicator Y are evaluated
- **THEN** `controlsLastY + halfBodyFontPx + spacing.md` MUST be `≤ musicY`

#### Scenario: Sound sits below music

- **GIVEN** music and sound indicator Y positions
- **WHEN** positions are evaluated
- **THEN** sound Y MUST be greater than music Y
