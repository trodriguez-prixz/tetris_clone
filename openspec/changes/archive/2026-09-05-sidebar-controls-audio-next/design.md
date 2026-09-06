# Design: Sidebar Controls↔audio clearance + NEXT locale

## Technical Approach

Controls last line (~Y 748) overlaps music (~Y 745) after Phase 19 Stats height. Reduce `AudioIndicatorRenderer` `offsetFromBottom` so music/SFX sit lower in a reserved footer band while preserving `SCORE_AREA_HEIGHT` and all Controls lines. Export layout helpers needed for a Y-clearance test. Replace hardcoded `NEXT` with `t('preview.next')`; add `refreshLocalizedLabel` and call it from `UIRenderer.refreshLocalizedUI`.

## Architecture Decisions

| Decision  | Choice                                     | Rationale                                      |
| --------- | ------------------------------------------ | ---------------------------------------------- |
| Clearance | Move audio band down                       | Avoids undoing Stats height or dropping help   |
| Constants | Keep offsets in AudioIndicator (+ exports) | Smallest change; optional shared if tests need |
| NEXT      | Catalog + PreviewRenderer `t()`            | Matches Phase 18 i18n pattern                  |
| Refresh   | Hook into existing `refreshLocalizedUI`    | Live `L` already refreshes sidebar             |

## Data Flow

Locale change → `refreshLocalizedUI` → preview label `setText(t('preview.next'))` + controls/audio as today.

## File Changes

| File                            | Action                                    |
| ------------------------------- | ----------------------------------------- |
| `AudioIndicatorRenderer.js`     | Lower offsets; export Y helpers for tests |
| `UIRenderer.js`                 | Export Controls layout; refresh preview   |
| `PreviewRenderer.js`            | `t('preview.next')` + refresh method      |
| `src/i18n/en.js`, `es.js`       | `preview.next`                            |
| `tests/AudioIndicator*.js` / UI | Clearance assertions                      |
| `tests/PreviewRenderer.test.js` | EN/ES label                               |
| `PLAN.md`                       | Phase 20 closeout                         |

## Testing Strategy

Strict TDD: failing clearance test; adjust offsets; failing ES `SIGUIENTE` test; catalog + wire; lint/test/format/build.

## Rollback Plan

Revert listed files; Phase 19 Stats height and Controls content stay.
