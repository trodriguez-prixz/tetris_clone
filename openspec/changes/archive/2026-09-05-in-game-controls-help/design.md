# Design: In-game controls help

## Technical Approach

Introduce a settings-adjacent `controlsHelp` module as the single copy contract for persistent Controls help. `UIRenderer` renders that list in the sidebar. `AudioIndicatorRenderer` drops its duplicate M/S shortcut line and keeps status-only indicators. Overlay action strings already match Phase 13/14 vocabulary; keep them short and lock them with tests. Do not change `InputController` bindings or Tetris rules.

## Architecture Decisions

| Decision        | Options                                               | Tradeoff                                          | Choice                                     |
| --------------- | ----------------------------------------------------- | ------------------------------------------------- | ------------------------------------------ |
| Copy home       | Inline in UIRenderer; `settings.js`; dedicated module | Inline drifts; settings grows; module is testable | **`src/config/controlsHelp.js`**           |
| Audio docs      | Keep M/S line + Controls M/S; Controls only           | Duplication vs one scan path                      | **Shortcuts in Controls; status in audio** |
| Restart wording | `R Restart`; `R Restart (game over)`                  | Ambiguity during play                             | **`R Restart (game over)`**                |
| Overlay dump    | Full legend on pause; short action only               | Clutter vs clarity                                | **Short action only** (already shipped)    |
| Input changes   | Remap for clarity; preserve                           | Discoverability ≠ remapping                       | **Preserve bindings**                      |

## Data Flow

```
controlsHelp.CONTROLS_HELP_LINES
  → UIRenderer.createGameplayControlsText()
       → sidebar Phaser text objects

AudioIndicatorRenderer
  → music/sound STATUS only (no shortcut doc line)

OverlayRenderer OVERLAY_CONTENT.*.action
  → start / pause / game-over next-action prompts (vocabulary-aligned)
```

## File Changes

| File                                              | Action | Description                                              |
| ------------------------------------------------- | ------ | -------------------------------------------------------- |
| `src/config/controlsHelp.js`                      | Create | Export help lines + optional binding inventory constants |
| `src/scenes/components/UIRenderer.js`             | Modify | Import and render shared Controls list                   |
| `src/scenes/components/AudioIndicatorRenderer.js` | Modify | Remove shortcut documentation text                       |
| `src/scenes/components/OverlayRenderer.js`        | Modify | Only if a vocabulary mismatch exists                     |
| `tests/controlsHelp.test.js`                      | Create | Contract coverage vs supported actions                   |
| `tests/UIRenderer.test.js`                        | Modify | Assert consolidated lines                                |
| `tests/AudioIndicatorRenderer.test.js`            | Modify | Assert no shortcut line                                  |
| `tests/OverlayRenderer.test.js`                   | Modify | Keep short-action guards                                 |
| `PLAN.md`                                         | Modify | Phase 15 progress / closeout                             |

## Interfaces / Contracts

```js
// src/config/controlsHelp.js
export const CONTROLS_HELP_LINES = [
  { text: 'Controls', emphasis: true },
  { text: '←/→ Move' },
  { text: '↑ Rotate' },
  { text: '↓ Soft drop' },
  { text: 'P/Space Pause' },
  { text: 'M Music' },
  { text: 'S Sound' },
  { text: 'R Restart (game over)' }
];
```

No `InputController` API changes.

## Testing Strategy

Strict TDD (`openspec/config.yaml`): RED → GREEN → REFACTOR per work unit.

| Layer | What                                                      | Approach                         |
| ----- | --------------------------------------------------------- | -------------------------------- |
| Unit  | Contract lines cover supported actions; exclude hard drop | `controlsHelp.test.js`           |
| Unit  | UIRenderer renders every contract line                    | `UIRenderer.test.js`             |
| Unit  | Audio has status, no shortcut doc                         | `AudioIndicatorRenderer.test.js` |
| Unit  | Overlay actions stay short + vocabulary                   | `OverlayRenderer.test.js`        |

## Threat Matrix

N/A — presentation/copy only; no new trust boundaries.

## Migration / Rollout

No data migration. Visual-only copy consolidation; revert via git if needed.

## Rollback Plan

Delete `controlsHelp.js`, restore prior UIRenderer/AudioIndicator/Overlay strings and tests.
