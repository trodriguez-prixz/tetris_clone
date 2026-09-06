# stats-panel-locale-fit Specification

## Purpose

Keep Stats panel metrics fully readable inside the panel for English and Spanish copy lengths.

## ADDED Requirements

### Requirement: Stats panel contains best-score line

The Stats panel height (`SCORE_AREA_HEIGHT`) MUST be large enough that the best-score text baseline/center plus half the body font size stays strictly above the panel bottom edge. Growing the panel MUST preserve the existing Controls clearance under Stats (Controls start Y derives from `SCORE_AREA_HEIGHT`).

#### Scenario: Best-score offset clears panel bottom

- **GIVEN** the Stats text layout places the high-score line at its configured offset Y
- **WHEN** panel height and body font size are evaluated
- **THEN** `highScoreOffsetY + halfBodyFontPx + bottomPadding` MUST be `<= SCORE_AREA_HEIGHT`

### Requirement: Controls still clear Stats after height grow

Controls start Y MUST remain at or below `scoreAreaBottom + PADDING * 2 + spacing.lg` after `SCORE_AREA_HEIGHT` grows.

#### Scenario: Controls still clear Stats after height grow

- **GIVEN** `SCORE_AREA_HEIGHT` is increased for locale fit
- **WHEN** Controls start Y is computed
- **THEN** Controls remain at or below `scoreAreaBottom + PADDING * 2 + spacing.lg`

### Requirement: Lock without line clear refreshes Stats

When a tetromino locks and no lines are cleared, the domain MUST still emit `SCORE_UPDATED` with current stats (including `pieces`) so the Stats panel can refresh.

#### Scenario: Lock without clears emits SCORE_UPDATED with pieces

- **GIVEN** an active piece that will lock without completing a row
- **WHEN** the piece locks
- **THEN** domain events include `SCORE_UPDATED` whose stats include the incremented `pieces` count
