# Proposal: Game-over outcome clarity

## Intent

Game-over overlay omits final score and best-score outcome. Snapshot uses `gameTime` while `Score.getAllStats()` / `StorageManager.updateStatistics()` use `time`, so `totalTime` can fail silently. Close the UX and persistence gap without changing Tetris rules.

## Scope

### In Scope

- Overlay: final score + best-score outcome (`New best` / `Best: N`); no lines/level/time
- Restart: keep `R`; add pointer/click restart on game-over overlay only; update action copy
- Align snapshot ↔ storage on `time` from `Score.getAllStats()`
- Focused tests for summary, wiring, persistence, restart
- Boundaries: `OverlayRenderer` presentation-only; `GameScene` storage/wiring; `GameState` pure

### Out of Scope

- Hard drop; remappable keys; ARIA/canvas a11y; mobile redesign
- Lifetime-stats / top-ten UI; scoring/spawn/lock formula changes
- Lines/level/time on the game-over overlay

## Capabilities

> Contract for sdd-spec. `openspec/specs/` has no existing capability specs.

### New Capabilities

- `game-over-overlay`: Final score, best-score outcome, restart affordances (`R` + pointer on overlay only).
- `game-over-stats-contract`: Snapshot field `time` compatible with storage and `Score.getAllStats()`.

### Modified Capabilities

- None

## Approach

1. Map elapsed seconds as `time` in `getGameOverStatsSnapshot()` (drop `gameTime`); keep pure.
2. Extend `OverlayRenderer.renderGameOverScreen` for run-summary data via existing overlay hierarchy/`VISUAL_SYSTEM`.
3. `GameScene` compares best score, passes summary to overlay; keeps persist/high-score policy.
4. `InputController`: pointerdown restart while game-over only; clear on restart.
5. Update focused Jest tests/mocks for fields, overlay, wiring, restart.

## Affected Areas

| Area                                          | Impact   | Description                        |
| --------------------------------------------- | -------- | ---------------------------------- |
| `src/logic/GameState.js`                      | Modified | Snapshot uses `time`               |
| `src/scenes/components/OverlayRenderer.js`    | Modified | Score + best-outcome; restart copy |
| `src/scenes/GameScene.js`                     | Modified | Snapshot → overlay summary wiring  |
| `src/scenes/components/InputController.js`    | Modified | Pointer restart on game-over       |
| `tests/` (GameState, Overlay, Scene, storage) | Modified | Contract + UX coverage             |
| `PLAN.md` Phase 14                            | Modified | Status notes as work completes     |

## Risks

| Risk                                 | Likelihood | Mitigation                                  |
| ------------------------------------ | ---------- | ------------------------------------------- |
| Overlay clutter hides restart        | Low        | Score + one outcome line; keep hierarchy    |
| Pointer restart leaks past game-over | Med        | Bind only during overlay; clear on teardown |
| Tests still assert `gameTime`        | Med        | Update tests to `time`                      |

## Rollback Plan

Revert snapshot rename, overlay summary API, pointer restart, and related tests. No storage migration; only the in-memory snapshot field name changes.

## Dependencies

- Confirmed decisions: overlay-summary, restart-input, time-field, boundaries
- PLAN.md Phase 14; research unselected; exploration skipped

## Success Criteria

- [ ] Overlay alone shows score, best-score outcome, and restart (`R` + click)
- [ ] Snapshot/storage use `time`; covered by tests
- [ ] No Phaser/storage in `GameState`; renderer stays presentation-only
- [ ] `npm run lint`, `npm test`, `npm run build` pass
