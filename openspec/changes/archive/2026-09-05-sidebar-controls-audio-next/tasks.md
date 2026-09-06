# Tasks: Sidebar Controls↔audio clearance + NEXT locale

## Review Workload Forecast

| Field                   | Value                            |
| ----------------------- | -------------------------------- |
| Estimated changed lines | 100–180                          |
| 400-line budget risk    | Low                              |
| Chained PRs recommended | No                               |
| Suggested split         | Single PR; 2–3 work-unit commits |
| Delivery strategy       | ask-on-risk                      |

Decision needed before apply: No
Chained PRs recommended: No
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal                       | Focused tests                                     |
| ---- | -------------------------- | ------------------------------------------------- |
| 1    | Controls↔audio clearance   | `AudioIndicatorRenderer` / `UIRenderer` clearance |
| 2    | NEXT / SIGUIENTE + refresh | `PreviewRenderer`, `i18n`                         |
| 3    | PLAN / SDD closeout        | lint/test/format/build                            |

## Phase 1: Controls↔audio clearance

- [x] 1.1 RED: assert last Controls Y + half body + `spacing.md` ≤ music Y (expect fail)
- [x] 1.2 GREEN: lower audio footer offsets so clearance passes; sound below music
- [x] 1.3 REFACTOR: export shared layout helpers if needed for stable tests

## Phase 2: Preview NEXT locale

- [x] 2.1 RED: ES expects `SIGUIENTE` for preview label / `t('preview.next')`
- [x] 2.2 GREEN: catalogs + PreviewRenderer `t()` + refresh via `refreshLocalizedUI`

## Phase 3: Closeout

- [x] 3.1 Close Phase 20: lint/test/format/build; archive SDD; mark PLAN `[x]` with Shipped blurb
