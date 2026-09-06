# Design: Player preferences (Settings)

## Technical Approach

Add StorageManager preference get/save. GameScene loads prefs once, passes ghostEnabled to BoardRenderer, seeds AudioController, and owns `settingsOpen`. OverlayRenderer renders settings panel (start) and pause preference lines. InputController binds G always and Esc when start/paused/settings-open. Single write path: toggle methods update prefs object, save, refresh UI/board/audio.

## Architecture Decisions

| Decision       | Choice                               | Rationale                         |
| -------------- | ------------------------------------ | --------------------------------- |
| Prefs home     | StorageManager + PREFERENCES key     | Matches existing storage boundary |
| Settings state | Scene `settingsOpen` flag            | Avoid GAME_STATES churn           |
| Pause UI       | Inline toggle lines on pause overlay | Discoverable without nested modal |
| Start UI       | Esc opens dedicated settings panel   | Keeps start hero clean            |

## Data Flow

```
load: StorageManager.getPreferences()
  → GameScene.preferences
  → BoardRenderer.setGhostEnabled / AudioController.applyPreferences

toggle (G/M/S or panel):
  → mutate preferences → savePreferences → update board/audio/indicators/overlays
```

## File Changes

| File                                       | Action                              |
| ------------------------------------------ | ----------------------------------- |
| `src/utils/storage.js`                     | Add preferences API                 |
| `src/scenes/components/BoardRenderer.js`   | Ghost gate                          |
| `src/scenes/components/AudioController.js` | apply/persist prefs                 |
| `src/scenes/GameScene.js`                  | Orchestration                       |
| `src/scenes/components/OverlayRenderer.js` | Settings + pause lines              |
| `src/scenes/components/InputController.js` | Esc, G                              |
| `src/config/controlsHelp.js`               | G Ghost                             |
| tests                                      | Prefs, board, audio, overlay, scene |
| `PLAN.md`                                  | Phase 16                            |

## Testing Strategy

Strict TDD per work unit. Unit tests for storage prefs, BoardRenderer ghost off, AudioController persist, Overlay settings/pause lines, GameScene Esc/start guard.

## Rollback Plan

Revert listed files; preferences key unused if removed.
