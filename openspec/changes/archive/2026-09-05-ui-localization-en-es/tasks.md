# Tasks: UI localization (EN/ES)

## Review Workload Forecast

| Field                   | Value                                                                    |
| ----------------------- | ------------------------------------------------------------------------ |
| Estimated changed lines | 450–650                                                                  |
| 400-line budget risk    | High                                                                     |
| Chained PRs recommended | Yes (optional; Single PR with 4 work-unit commits if maintainer accepts) |
| Suggested split         | Four work-unit commits / ask-on-risk                                     |
| Delivery strategy       | ask-on-risk                                                              |

Decision needed before apply: Yes
Chained PRs recommended: Yes
400-line budget risk: High

### Suggested Work Units

| Unit | Goal                      | Focused tests                                 |
| ---- | ------------------------- | --------------------------------------------- |
| 1    | i18n + storage locale     | `tests/i18n.test.js`, `tests/storage.test.js` |
| 2    | Wire UI copy to `t()`     | Overlay, Score, Audio, controlsHelp, Input    |
| 3    | L/Settings + live refresh | GameScene, InputController                    |
| 4    | PLAN + OpenSpec closeout  | N/A docs                                      |

## Phase 1: i18n + storage

- [x] 1.1 RED: i18n t()/setLocale tests; storage locale default/round-trip/invalid
- [x] 1.2 GREEN: `src/i18n/*` + StorageManager `locale`
- [x] 1.3 REFACTOR: shared normalizeLocale

## Phase 2: Wire surfaces

- [x] 2.1 RED: Overlay prefs include language; controlsHelp has L; Spanish overlay smoke
- [x] 2.2 GREEN: Overlay, controlsHelp, ScoreDisplay, AudioIndicator, Input messages via `t()`
- [x] 2.3 REFACTOR: preferenceLines use t()

## Phase 3: Toggle + refresh

- [x] 3.1 RED: L cycles locale; refresh updates open settings/pause
- [x] 3.2 GREEN: InputController L + GameScene refreshLocalizedUI
- [x] 3.3 REFACTOR: single save/refresh path

## Phase 4: Closeout

- [x] 4.1 Update PLAN Phase 18; merge specs on archive
- [x] 4.2 lint/test/format/build
