# Proposal: Player preferences (Settings)

## Intent

Players cannot persist presentation preferences. Ghost is always on; M/S reset each session. Add persisted ghost/audio prefs with a Settings surface on start/pause and synced hotkeys (PLAN.md Phase 16).

## Scope

### In Scope

- Persist `{ ghostEnabled, musicMuted, soundEnabled }` via StorageManager
- Gate ghost drawing from preference (default ON)
- Load/save audio toggles through AudioController
- Settings panel: Esc open/close on start; pause overlay shows toggle lines
- Hotkey `G` for ghost; `M`/`S` persist; Controls copy update
- Focused tests; PLAN.md Phase 16 status

### Out of Scope

- Hard drop, remappable keys, reduced-motion, effects intensity, touch, ARIA
- New GAME_STATES value

## Capabilities

### New Capabilities

- `player-preferences`: Persistence contract and defaults for presentation prefs.
- `settings-overlay`: Start/pause Settings discoverability and toggle display.

### Modified Capabilities

- None (controls-help gains a line via implementation; treat as copy update unless delta needed)

## Approach

1. StorageManager preferences API with defaults/corrupt fallback.
2. BoardRenderer + AudioController consume prefs; GameScene owns orchestration.
3. OverlayRenderer settings panel + pause toggle lines; InputController Esc/G.
4. Strict TDD; update controlsHelp with `G Ghost`.

## Affected Areas

| Area                                       | Impact       | Description                         |
| ------------------------------------------ | ------------ | ----------------------------------- |
| `src/utils/storage.js`                     | Modified     | Preferences get/save                |
| `src/scenes/components/BoardRenderer.js`   | Modified     | Ghost gate                          |
| `src/scenes/components/AudioController.js` | Modified     | Load/persist audio prefs            |
| `src/scenes/GameScene.js`                  | Modified     | Prefs wiring, settings open flag    |
| `src/scenes/components/OverlayRenderer.js` | Modified     | Settings/pause toggle UI            |
| `src/scenes/components/InputController.js` | Modified     | Esc, G                              |
| `src/config/controlsHelp.js`               | Modified     | G Ghost                             |
| `tests/*`                                  | Modified/New | Prefs, ghost, audio, overlay, scene |
| `PLAN.md`                                  | Modified     | Phase 16                            |

## Risks

| Risk                    | Likelihood | Mitigation                                                  |
| ----------------------- | ---------- | ----------------------------------------------------------- |
| Esc starts game         | Med        | Ignore Esc in start trigger; block start while settingsOpen |
| Pause resume via toggle | Low        | Toggles only update prefs; P/Space resume unchanged         |
| Corrupt localStorage    | Low        | Defaults on parse failure                                   |

## Rollback Plan

Revert prefs API, ghost gate, audio persist, settings UI/input, and related tests. High-score/stats keys untouched.

## Dependencies

- Confirmed Phase 16 decisions; research unselected

## Success Criteria

- [ ] Prefs persist across reload
- [ ] Ghost/audio toggles work via panel and hotkeys
- [ ] Settings does not start/resume game
- [ ] lint/test/build pass
