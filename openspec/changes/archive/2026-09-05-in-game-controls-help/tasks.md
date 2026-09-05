# Tasks: In-game controls help

## Review Workload Forecast

| Field                   | Value                             |
| ----------------------- | --------------------------------- |
| Estimated changed lines | 180–280                           |
| 400-line budget risk    | Low                               |
| Chained PRs recommended | No                                |
| Suggested split         | Single PR; four work-unit commits |
| Delivery strategy       | ask-on-risk                       |
| Chain strategy          | pending                           |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal                      | Likely PR | Focused test command                                                        | Runtime harness   | Rollback boundary                    |
| ---- | ------------------------- | --------- | --------------------------------------------------------------------------- | ----------------- | ------------------------------------ |
| 1    | Shared copy contract      | PR 1      | `npm test -- tests/controlsHelp.test.js`                                    | N/A — pure config | `controlsHelp.js` + test             |
| 2    | Sidebar + audio split     | PR 1      | `npm test -- tests/UIRenderer.test.js tests/AudioIndicatorRenderer.test.js` | N/A — Jest/jsdom  | UIRenderer + AudioIndicator + tests  |
| 3    | Overlay vocabulary guards | PR 1      | `npm test -- tests/OverlayRenderer.test.js`                                 | N/A — Jest/jsdom  | Overlay copy only if changed + tests |
| 4    | PLAN.md Phase 15 closeout | PR 1      | N/A — docs                                                                  | N/A — planning    | `PLAN.md` Phase 15                   |

## Phase 1: Shared copy contract (work unit 1)

- [x] 1.1 RED: `tests/controlsHelp.test.js` — contract includes move/rotate/soft drop/P-Space pause/M/S/R game-over; excludes hard drop.
- [x] 1.2 GREEN: Add `src/config/controlsHelp.js` exporting `CONTROLS_HELP_LINES`.
- [x] 1.3 REFACTOR: Keep module presentation-only (no Phaser/input imports).

## Phase 2: Sidebar consolidated help + audio split (work unit 2)

- [x] 2.1 RED: `tests/UIRenderer.test.js` — sidebar renders every non-header contract line (+ Controls header).
- [x] 2.2 RED: `tests/AudioIndicatorRenderer.test.js` — status labels remain; shortcut doc line absent.
- [x] 2.3 GREEN: `UIRenderer` consumes `CONTROLS_HELP_LINES`.
- [x] 2.4 GREEN: `AudioIndicatorRenderer` removes `M: Music | S: Sound` (or equivalent) shortcut line.
- [x] 2.5 REFACTOR: Preserve layout tokens/`VISUAL_SYSTEM`; avoid overlapping status/feedback.

## Phase 3: Overlay vocabulary alignment (work unit 3)

- [x] 3.1 RED: Strengthen/confirm `OverlayRenderer` tests for short start/pause/game-over actions (P exception, P/Space resume, R+click restart).
- [x] 3.2 GREEN: Adjust `OVERLAY_CONTENT` action strings only if vocabulary drifts from help keys.
- [x] 3.3 REFACTOR: Do not add a full controls manual to overlays.

## Phase 4: PLAN.md Phase 15 closeout (work unit 4)

- [x] 4.1 Update `PLAN.md` Phase 15 notes as units 1–3 complete.
- [x] 4.2 Mark Phase 15 done after lint/test/format/build pass for units 1–3.
