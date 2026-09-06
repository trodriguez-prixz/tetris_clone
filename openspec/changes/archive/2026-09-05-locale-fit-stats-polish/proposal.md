# Proposal: Locale-fit Stats polish

## Intent

Spanish Stats UI clips the best-score line at the panel bottom and still shows English `STATS`. Fix panel clearance and the catalog gap (PLAN.md Phase 19) without changing Tetris rules.

## Scope

### In Scope

- Grow `SCORE_AREA_HEIGHT` (and/or bottom padding) so best-score stays inside the panel in EN and ES
- Preserve Phase 17 Controls clearance under Stats
- Spanish `stats.title` → `ESTADÍSTICAS`
- Focused tests; reproduce Piezas/Puntos 0 and fix or park
- PLAN Phase 19 closeout

### Out of Scope

- Localizing `ON`/`OFF`, new locales, Stats redesign, hard drop, remaps, ARIA

## Capabilities

### New Capabilities

- `stats-panel-locale-fit`: Stats panel height MUST contain all metric lines including best score for EN/ES

### Modified Capabilities

- `ui-localization`: Spanish catalog MUST translate `stats.title`

## Approach

1. Raise `SCORE_AREA_HEIGHT` so content bottom clears half body font + spacing.
2. Translate ES `stats.title`; keep EN.
3. Strict TDD tests for clearance and title; reproduce pieces anomaly then fix or park.

## Affected Areas

| Area                                  | Impact   | Description                |
| ------------------------------------- | -------- | -------------------------- |
| `src/config/settings.js`              | Modified | `SCORE_AREA_HEIGHT`        |
| `src/i18n/es.js`                      | Modified | `stats.title`              |
| `src/scenes/components/*` (if needed) | Modified | Layout export/helpers only |
| `tests/*`                             | Modified | Clearance + i18n title     |
| `PLAN.md` / openspec                  | Modified | Phase 19 closeout          |

## Risks

| Risk                  | Likelihood | Mitigation                                  |
| --------------------- | ---------- | ------------------------------------------- |
| Controls crowd canvas | Low        | Height bump modest; Controls Y auto-follows |
| Piezas false positive | Med        | Repro gate before code change               |

## Rollback Plan

Revert `SCORE_AREA_HEIGHT`, `es.js` title, related tests, and PLAN/openspec Phase 19 notes.

## Dependencies

- Confirmed Phase 19 locked decisions; Phase 17 Controls gap and Phase 18 i18n remain

## Success Criteria

- [ ] Best-score line fully inside Stats panel in EN and ES
- [ ] ES title `ESTADÍSTICAS`; EN `STATS`
- [ ] Piezas anomaly fixed with test or explicitly parked
- [ ] lint/test/format/build pass
