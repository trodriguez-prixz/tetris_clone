# Design: Locale-fit Stats polish

## Technical Approach

`HIGH_SCORE_Y` (~276) plus half body font (8px for 16px body) exceeds `SCORE_AREA_HEIGHT` (280), so the best-score line clips. Raise `SCORE_AREA_HEIGHT` in `settings.js` with enough bottom padding (`spacing.lg` or equivalent) so clearance holds for EN/ES without shortening Spanish strings. Controls start Y already includes `SCORE_AREA_HEIGHT` + Phase 17 `spacing.lg`, so it moves down automatically. Translate `stats.title` in `es.js` only. Piezas/Puntos 0 reproduced: `SCORE_UPDATED` only fired on line clear; emit also on lock-without-clear in `checkFinishedRows`.

## Architecture Decisions

| Decision       | Choice                                     | Rationale                                   |
| -------------- | ------------------------------------------ | ------------------------------------------- |
| Overflow       | Grow `SCORE_AREA_HEIGHT`                   | Matches Phase 19; avoids truncating ES copy |
| Layout math    | Keep `ScoreDisplayRenderer` Ys             | Minimal change; constants stay centralized  |
| Title          | Catalog-only ES string                     | No renderer API change                      |
| Piezas anomaly | Emit `SCORE_UPDATED` on lock-without-clear | UI was stale until first line clear         |
| Ownership      | settings + i18n + GameState + tests        | Matches AGENTS.md boundaries                |

## Data Flow

Lock → `checkFinishedRows` → `SCORE_UPDATED` (always) → EventBus → ScoreDisplay. Locale refresh already re-reads `t('stats.title')`.

## File Changes

| File                                            | Action                                 |
| ----------------------------------------------- | -------------------------------------- |
| `src/config/settings.js`                        | Increase `SCORE_AREA_HEIGHT`           |
| `src/i18n/es.js`                                | `stats.title` → `ESTADÍSTICAS`         |
| `src/logic/GameState.js`                        | `SCORE_UPDATED` on lock without clears |
| `src/scenes/components/ScoreDisplayRenderer.js` | Export high-score offset for tests     |
| `tests/ScoreDisplayRenderer.test.js`            | Clearance assertion                    |
| `tests/i18n.test.js`                            | ES/EN stats title                      |
| `tests/GameState.test.js`                       | Lock emits `SCORE_UPDATED`             |
| `tests/UIRenderer.test.js`                      | Existing Controls gap still passes     |
| `PLAN.md`                                       | Phase 19 closeout                      |

## Testing Strategy

Strict TDD: failing clearance + ES title tests first; grow height + catalog; Controls gap regression; RED lock `SCORE_UPDATED` then GREEN; lint/test/format/build.

## Rollback Plan

Revert listed files; Phase 18 i18n and Phase 17 overlay stack untouched beyond height side effect.
