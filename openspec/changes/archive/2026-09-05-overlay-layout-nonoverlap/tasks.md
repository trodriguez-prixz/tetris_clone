# Tasks: Overlay layout non-overlap

## Review Workload Forecast

| Field                   | Value                            |
| ----------------------- | -------------------------------- |
| Estimated changed lines | 120–200                          |
| 400-line budget risk    | Low                              |
| Chained PRs recommended | No                               |
| Suggested split         | Single PR; two work-unit commits |
| Delivery strategy       | ask-on-risk                      |

Decision needed before apply: No
Chained PRs recommended: No
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal                        | Focused tests                    |
| ---- | --------------------------- | -------------------------------- |
| 1    | Overlay non-overlap layout  | `tests/OverlayRenderer.test.js`  |
| 2    | Sidebar Controls gap + PLAN | `tests/UIRenderer.test.js`, PLAN |

## Phase 1: Overlay stack

- [x] 1.1 RED: pause/settings tests assert preference and action Y separation ≥ preference line step
- [x] 1.2 GREEN: OverlayRenderer stacks prefs then action for pause and settings
- [x] 1.3 REFACTOR: share one stack path; keep copy/hotkey behavior unchanged

## Phase 2: Sidebar gap + closeout

- [x] 2.1 RED/GREEN: Controls start Y clears Stats Record with a modest extra gap
- [x] 2.2 Update PLAN.md Phase 17 notes; mark done after lint/test/format/build
