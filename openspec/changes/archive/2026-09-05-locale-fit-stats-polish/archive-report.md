# Archive Report: locale-fit-stats-polish

**Archived at**: 2026-09-06T02:00:00Z
**Archive path**: `openspec/changes/archive/2026-09-05-locale-fit-stats-polish/`
**Artifact store**: openspec
**Final status**: success

## What shipped

- `SCORE_AREA_HEIGHT` 280 → 304 so best-score clears Stats panel in EN/ES
- Exported `SCORE_PANEL_HIGH_SCORE_OFFSET_Y` for clearance tests
- Spanish `stats.title` → `ESTADÍSTICAS`
- Lock without line clear emits `SCORE_UPDATED` (fixes Piezas stuck at 0)
- Main specs: `stats-panel-locale-fit` (new), `ui-localization` (title requirement)
- PLAN.md Phase 19 closed

## Verification (at close)

- `npm test` — 109 passed
- lint / format:check / build — pass
- Verify verdict: pass (4/4 requirements, 5/5 scenarios)
