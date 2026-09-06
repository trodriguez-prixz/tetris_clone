# Tasks: Locale-fit Stats polish

## Review Workload Forecast

| Field                   | Value                            |
| ----------------------- | -------------------------------- |
| Estimated changed lines | 80–150                           |
| 400-line budget risk    | Low                              |
| Chained PRs recommended | No                               |
| Suggested split         | Single PR; 2–3 work-unit commits |
| Delivery strategy       | ask-on-risk                      |

Decision needed before apply: No
Chained PRs recommended: No
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal                             | Focused tests                           |
| ---- | -------------------------------- | --------------------------------------- |
| 1    | Panel height clearance           | `tests/ScoreDisplayRenderer.test.js`    |
| 2    | ES stats title + Controls smoke  | `tests/i18n.test.js`, `UIRenderer`      |
| 3    | Piezas repro + PLAN/SDD closeout | GameState pieces if fix; else park note |

## Phase 1: Stats panel clearance

- [x] 1.1 RED: assert high-score offset + half body font + padding ≤ `SCORE_AREA_HEIGHT` (expect fail at 280)
- [x] 1.2 GREEN: grow `SCORE_AREA_HEIGHT` so clearance passes; Controls gap test still green
- [x] 1.3 REFACTOR: export shared high-score offset if needed to avoid duplicated magic in tests

## Phase 2: Catalog title

- [x] 2.1 RED: `t('stats.title')` under `es` expects `ESTADÍSTICAS`
- [x] 2.2 GREEN: set `src/i18n/es.js` `stats.title`; EN remains `STATS`

## Phase 3: Piezas anomaly + closeout

- [x] 3.1 Reproduce Piezas/Puntos 0 after piece locks; fix with regression test OR park as false alarm in PLAN
  - Root cause: `SCORE_UPDATED` only fired on line clear; emit also on lock-without-clear in `checkFinishedRows`.
- [x] 3.2 Close Phase 19: lint/test/format/build; archive SDD; mark PLAN overview `[x]` with Shipped blurb
