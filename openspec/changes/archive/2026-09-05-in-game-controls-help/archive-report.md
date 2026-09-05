# Archive Report: in-game-controls-help

**Archived at**: 2026-09-05T23:50:00Z
**Archive path**: `openspec/changes/archive/2026-09-05-in-game-controls-help/`
**Artifact store**: openspec
**Final status**: success

## What shipped

- Shared `src/config/controlsHelp.js` contract for persistent Controls help
- `UIRenderer` renders consolidated play + audio + restart (game over) help
- `AudioIndicatorRenderer` status-only (no duplicate M/S shortcut line)
- Overlay short next-action prompts locked by regression tests (no content rewrite needed)
- Main spec: `openspec/specs/controls-help/spec.md`
- PLAN.md Phase 15 marked `[x]`

## Verification at close

- Verdict: pass (4/4 requirements, 4/4 scenarios)
- `npm test`: 86 passed
- `npm run lint` / `format:check` / `build`: exit 0

## Intentional non-goals (unchanged)

- Hard drop, remappable keys, H-toggle help, deeper a11y
