# Tasks: Player preferences (Settings)

## Review Workload Forecast

| Field                   | Value                             |
| ----------------------- | --------------------------------- |
| Estimated changed lines | 350–450                           |
| 400-line budget risk    | Medium                            |
| Chained PRs recommended | No                                |
| Suggested split         | Single PR; four work-unit commits |
| Delivery strategy       | ask-on-risk                       |

### Suggested Work Units

| Unit | Goal                      | Focused tests                               |
| ---- | ------------------------- | ------------------------------------------- |
| 1    | Preferences storage       | `tests/storage.test.js`                     |
| 2    | Ghost + audio wiring      | BoardRenderer, AudioController tests        |
| 3    | Settings UI + Esc/G       | OverlayRenderer, GameScene, InputController |
| 4    | PLAN.md Phase 16 closeout | N/A docs                                    |

## Phase 1: Preferences storage

- [x] 1.1 RED: storage tests for defaults, round-trip, corrupt fallback
- [x] 1.2 GREEN: StorageManager getPreferences/savePreferences
- [x] 1.3 REFACTOR: keep high-score/stats keys untouched

## Phase 2: Ghost + audio consumers

- [x] 2.1 RED: BoardRenderer skips ghost when disabled
- [x] 2.2 RED: AudioController loads/saves prefs on toggle
- [x] 2.3 GREEN: implement BoardRenderer + AudioController + GameScene seed
- [x] 2.4 REFACTOR: single prefs object ownership in GameScene

## Phase 3: Settings UI + input

- [x] 3.1 RED: Overlay pause lines + settings panel; GameScene Esc/start guard; G toggle
- [x] 3.2 GREEN: OverlayRenderer, InputController, GameScene, controlsHelp
- [x] 3.3 REFACTOR: panel and hotkeys share toggle helpers

## Phase 4: PLAN closeout

- [x] 4.1 Update PLAN.md Phase 16 notes as units complete
- [x] 4.2 Mark Phase 16 done after lint/test/format/build
