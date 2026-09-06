# Proposal: Sidebar Controls↔audio clearance + NEXT locale

## Intent

After taller Stats (Phase 19), the Controls restart line overlaps the audio footer. Preview still shows hardcoded English `NEXT`. Fix clearance and localize the label (PLAN.md Phase 20).

## Scope

### In Scope

- Reserve bottom audio band so last Controls line clears music by ≥ `spacing.md`
- Keep `SCORE_AREA_HEIGHT` and full Controls list
- `preview.next` EN/ES; `PreviewRenderer` + locale refresh
- Focused tests; PLAN Phase 20 closeout

### Out of Scope

- Soft-drop scoring, `ON`/`OFF` i18n, emoji removal, hard drop, remaps, ARIA, sidebar redesign

## Capabilities

### New Capabilities

- `sidebar-controls-audio-clearance`: Controls legend MUST clear audio footer indicators

### Modified Capabilities

- `ui-localization`: Preview next-queue label MUST use catalogs (`preview.next`)

## Approach

1. Lower audio indicator Y via smaller `offsetFromBottom` (and/or shared footer constants).
2. Assert Controls last-line vs music Y in tests.
3. Wire `t('preview.next')` and refresh on locale change.

## Affected Areas

| Area                        | Impact   | Description                               |
| --------------------------- | -------- | ----------------------------------------- |
| `AudioIndicatorRenderer.js` | Modified | Footer band offsets                       |
| `UIRenderer.js`             | Modified | Export layout for tests / preview refresh |
| `PreviewRenderer.js`        | Modified | `t('preview.next')`                       |
| `src/i18n/en.js`, `es.js`   | Modified | `preview.next`                            |
| tests / PLAN / openspec     | Modified | Coverage + Phase 20                       |

## Risks

| Risk                           | Likelihood | Mitigation                        |
| ------------------------------ | ---------- | --------------------------------- |
| Audio too close to canvas edge | Low        | Keep ≥ half-font above bottom pad |
| Longer ES Controls strings     | Low        | Clearance is Y-based, not width   |

## Rollback Plan

Revert audio offsets, preview i18n wiring, related tests, and PLAN/openspec Phase 20 notes.

## Dependencies

- Confirmed Phase 20 locked decisions; Phase 19 Stats height remains

## Success Criteria

- [ ] Controls restart line does not overlap music/SFX
- [ ] Preview label `NEXT` / `SIGUIENTE` with live locale refresh
- [ ] lint/test/format/build pass
