# Tasks: Game-over outcome clarity

## Review Workload Forecast

| Field                   | Value                             |
| ----------------------- | --------------------------------- |
| Estimated changed lines | 280–380                           |
| 400-line budget risk    | Medium                            |
| Chained PRs recommended | No                                |
| Suggested split         | Single PR; four work-unit commits |
| Delivery strategy       | ask-on-risk                       |
| Chain strategy          | pending                           |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal                           | Likely PR | Focused test command                                                | Runtime harness           | Rollback boundary                                      |
| ---- | ------------------------------ | --------- | ------------------------------------------------------------------- | ------------------------- | ------------------------------------------------------ |
| 1    | Snapshot/storage `time`        | PR 1      | `npm test -- tests/GameState.test.js tests/storage.test.js`         | N/A — domain/storage unit | `GameState.js`, `storage.js` if touched, related tests |
| 2    | Overlay summary + scene wiring | PR 1      | `npm test -- tests/OverlayRenderer.test.js tests/GameScene.test.js` | N/A — Jest/jsdom          | Overlay + `GameScene` summary path + tests             |
| 3    | Pointer restart + teardown     | PR 1      | `npm test -- tests/GameScene.test.js`                               | N/A — input mocks         | `InputController.js`, restart bind/clear + tests       |
| 4    | PLAN.md Phase 14 closeout      | PR 1      | N/A — docs                                                          | N/A — planning            | `PLAN.md` Phase 14 only                                |

## Phase 1: Snapshot/storage `time` (work unit 1)

- [x] 1.1 RED: `tests/GameState.test.js` — snapshot has `time` (= `getAllStats().time`), no `gameTime` key.
- [x] 1.2 RED: Add `tests/storage.test.js` — `totalTime` += `time`; `gameTime`-only does not accumulate.
- [x] 1.3 GREEN: `src/logic/GameState.js` — `time: stats.time` in snapshot; omit `gameTime`.
- [x] 1.4 GREEN: Confirm `src/utils/storage.js` uses `gameStats.time`; edit only if 1.2 requires it.
- [x] 1.5 REFACTOR: Keep GameState pure; tidy tests with code.

## Phase 2: Overlay summary + GameScene wiring (work unit 2)

- [x] 2.1 RED: `tests/OverlayRenderer.test.js` — score + outcome; no lines/level/time; action mentions R + click.
- [x] 2.2 RED: `tests/GameScene.test.js` — pre-save best compare; summary to overlay; persist `time`; high-score policy.
- [x] 2.3 GREEN: `src/scenes/components/OverlayRenderer.js` — `renderGameOverScreen({ score, outcomeLabel })`; drop “Run ended”.
- [x] 2.4 GREEN: `src/scenes/GameScene.js` — capture `previousBest` before persist; pass summary; scene owns storage.
- [x] 2.5 REFACTOR: Overlay presentation-only (no storage).

## Phase 3: Pointer restart + teardown (work unit 3)

- [x] 3.1 RED: `tests/GameScene.test.js` — bind R + `pointerdown` on game-over; clear on restart; inactive outside.
- [x] 3.2 GREEN: `src/scenes/components/InputController.js` — pointer in `bindRestartInput`; clear both in `clearRestartInput`.
- [x] 3.3 GREEN: `src/scenes/GameScene.js` — restart/dismiss calls `clearRestartInput` (no leak).
- [x] 3.4 REFACTOR: Mirror start-screen bind/clear pattern.

## Phase 4: PLAN.md Phase 14 closeout (work unit 4)

- [x] 4.1 Update `PLAN.md` Phase 14 notes for units 1–3 as each completes.
- [x] 4.2 Mark Phase 14 done after lint/test/build pass for units 1–3.
