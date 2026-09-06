# Design: Overlay layout non-overlap

## Technical Approach

`OverlayRenderer` currently places preference lines at `preferenceStart.offsetY` (`xl`) while `action` sits at `xl + lg`, so Music/Sound collide with the resume/close prompt. Replace that with a stacked layout: render title/status as today, place preference rows in a contiguous block, then place the action (and optional hint) below the last preference row using `VISUAL_SYSTEM.spacing` gaps. Share the same stack for pause and settings. For sidebar tightness, increase `GAMEPLAY_CONTROLS_START_Y` by one spacing token so Controls clears Stats Record without resizing gameplay geometry.

## Architecture Decisions

| Decision      | Choice                      | Rationale                                 |
| ------------- | --------------------------- | ----------------------------------------- |
| Layout model  | Relative stack after prefs  | Fixes collision without new UI framework  |
| Pause content | Keep inline G/M/S lines     | Preserves Phase 16 discoverability        |
| Settings      | Same stack helper path      | Prevents duplicate offset bugs            |
| Sidebar       | Nudge Controls start Y only | Smallest fix for Record↔Controls pressure |
| Audio footer  | Unchanged                   | Duplication is not a layout collision     |

## Data Flow

No preference/state flow changes. Rendering only:

```
renderPause/Settings(preferences)
  → overlay + title + status
  → preference lines at stacked Y
  → action (resume / Esc close) below last pref + gap
```

## File Changes

| File                                       | Action                                 |
| ------------------------------------------ | -------------------------------------- |
| `src/scenes/components/OverlayRenderer.js` | Stacked preference + action layout     |
| `src/scenes/components/UIRenderer.js`      | Modest Controls vertical offset        |
| `tests/OverlayRenderer.test.js`            | Y non-overlap assertions               |
| `tests/UIRenderer.test.js`                 | Update expected Controls Y if asserted |
| `PLAN.md`                                  | Phase 17                               |

## Testing Strategy

Strict TDD: failing Y-separation tests for pause/settings first; then layout fix; then Controls gap assertion or smoke; lint/test/format/build.

## Rollback Plan

Revert listed files; preference hotkeys and storage untouched.
