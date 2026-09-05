# Design: Game-over outcome clarity

## Technical Approach

Close the game-over UX/persistence gap per proposal and specs `game-over-overlay` / `game-over-stats-contract`: align snapshot field `time` with `Score.getAllStats()`, have `GameScene` compute a presentation-only run summary (score + best outcome) before persist so “new best” is not corrupted by post-save `getBestScore()`, extend `OverlayRenderer.renderGameOverScreen(summary)`, and mirror start-screen pointer binding for game-over restart with teardown on restart. Ownership stays: pure `GameState`, presentation `OverlayRenderer`, wiring/storage `GameScene` / `InputController`.

## Architecture Decisions

| Decision             | Options                                                      | Tradeoff                                                                                      | Choice                                                                                |
| -------------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Snapshot elapsed key | Keep `gameTime` + teach storage; rename snapshot to `time`   | Dual names keep the silent `totalTime` bug; rename matches `getAllStats` / `updateStatistics` | **`time` from `stats.time`** (drop snapshot `gameTime`)                               |
| Outcome policy owner | Overlay reads storage; Scene compares and passes labels/kind | Overlay owning policy breaks boundaries                                                       | **Scene compares `score` vs pre-save best**; passes `{ score, outcomeLabel }`         |
| When to read best    | After `saveHighScore`; before persist                        | After-save makes new best look like “Best: N”                                                 | **Capture `previousBest` before persist**                                             |
| Overlay layout       | Replace status only; add score + outcome slots               | Clutter vs clarity                                                                            | **Title + score + outcome + action**; drop “Run ended”; no lines/level/time           |
| Pointer restart      | Global always-on; bind only on game-over                     | Leak risk outside overlay                                                                     | **`pointerdown` in `bindRestartInput` only**; clear with R key in `clearRestartInput` |
| Restart copy         | R-only; R + click                                            | Spec requires both                                                                            | **Action mentions R and click/tap**                                                   |

## Data Flow

```
GAME_OVER
  → GameScene.onGameOver
       → snapshot = GameState.getGameOverStatsSnapshot()  // { …, time }
       → previousBest = StorageManager.getBestScore()
       → isNewBest = snapshot.score > previousBest
       → persist (saveHighScore if isNewBest; updateStatistics(snapshot))
       → OverlayRenderer.renderGameOverScreen({
            score, outcomeLabel: isNewBest ? 'New best' : `Best: ${previousBest}`
          })
       → InputController.bindRestartInput(restart)  // R + pointerdown
  → restart / dismiss
       → clearGameOverScreen + clearRestartInput (key + pointer)
```

## File Changes

| File                                         | Action        | Description                                                           |
| -------------------------------------------- | ------------- | --------------------------------------------------------------------- |
| `src/logic/GameState.js`                     | Modify        | Snapshot maps `time: stats.time`; omit `gameTime`                     |
| `src/scenes/GameScene.js`                    | Modify        | Pre-save best compare; pass summary into overlay; keep persist policy |
| `src/scenes/components/OverlayRenderer.js`   | Modify        | `renderGameOverScreen(summary)`; score/outcome layout; action copy    |
| `src/scenes/components/InputController.js`   | Modify        | Pointer restart + teardown (same pattern as `bindStartInput`)         |
| `tests/GameState.test.js`                    | Modify        | Assert `time`; mock `getAllStats` with `time`                         |
| `tests/OverlayRenderer.test.js`              | Modify        | Summary text, no lines/level/time, dual restart copy                  |
| `tests/GameScene.test.js`                    | Modify        | Summary wiring, `time` in persist mocks, pointer bind/clear           |
| `tests/storage.test.js` (or extend existing) | Create/Modify | `totalTime` += `time`; `gameTime`-only does not accumulate            |
| `PLAN.md`                                    | Modify        | Phase 14 status notes as groups complete                              |

## Interfaces / Contracts

```js
// GameState.getGameOverStatsSnapshot()
{ score, level, lines, pieces, tetrises, time }  // time === getAllStats().time

// OverlayRenderer.renderGameOverScreen(summary)
summary: { score: number, outcomeLabel: 'New best' | `Best: ${n}` }

// InputController.bindRestartInput(onRestart) / clearRestartInput()
// Binds R + scene.input pointerdown; clear removes both
```

`StorageManager.updateStatistics` stays `stats.totalTime += gameStats.time` (no API change).

## Testing Strategy

`openspec/config.yaml`: `strict_tdd: true` / `rules.apply.tdd: true` — **RED → GREEN → REFACTOR** per work unit; no production change without a failing test first.

| Layer | What to Test                                                                     | Approach                                            |
| ----- | -------------------------------------------------------------------------------- | --------------------------------------------------- |
| Unit  | Snapshot `time`; no `gameTime` key; equals `getAllStats().time`                  | `GameState.test.js` RED first                       |
| Unit  | `updateStatistics` accumulates `time`; ignores lone `gameTime`                   | Focused storage test RED first                      |
| Unit  | Overlay shows score + outcome; omits lines/level/time; action mentions R + click | `OverlayRenderer.test.js`                           |
| Unit  | Scene passes summary; persists `time`; pointer bind/clear on restart             | `GameScene.test.js` (+ InputController if isolated) |

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary.

## Migration / Rollout

No migration. In-memory snapshot field rename only; existing localStorage stats untouched. Rollback: revert listed files/tests.

## Open Questions

- None — decisions confirmed in `state.yaml` (overlay-summary, restart-input, time-field, boundaries).
