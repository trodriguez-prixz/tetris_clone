# Proposal: Overlay layout non-overlap

## Intent

Pause overlay stacks Ghost/Music/Sound preference lines on the same Y band as “Press P or Space to resume”, making pause controls unreadable. Fix vertical layout without changing Tetris rules or preference behavior (PLAN.md Phase 17).

## Scope

### In Scope

- Non-overlapping vertical stack for pause: title → status → G/M/S lines → resume action
- Same stack contract for Settings (prefs + Esc to close)
- Regression test asserting distinct Y positions with minimum gap
- Modest Stats→Controls sidebar gap
- PLAN.md Phase 17 status

### Out of Scope

- Removing footer Music/Sound status duplication
- Hard drop, remaps, ARIA, touch, new GAME_STATES
- Preference persistence or hotkey semantics changes

## Capabilities

### New Capabilities

- None

### Modified Capabilities

- `settings-overlay`: Require non-overlapping pause/settings preference + action layout

## Approach

1. Replace absolute colliding offsets in `OverlayRenderer` with a stacked layout (prefs then action below).
2. Add focused Y-separation tests for pause and settings.
3. Nudge Controls start Y (or equivalent) for Stats→Controls clearance.
4. Close Phase 17 after lint/test/format/build.

## Affected Areas

| Area                                       | Impact   | Description                        |
| ------------------------------------------ | -------- | ---------------------------------- |
| `src/scenes/components/OverlayRenderer.js` | Modified | Stacked pause/settings text layout |
| `src/scenes/components/UIRenderer.js`      | Modified | Modest Controls vertical gap       |
| `tests/OverlayRenderer.test.js`            | Modified | Non-overlap assertions             |
| `tests/UIRenderer.test.js`                 | Modified | Gap regression if present          |
| `PLAN.md`                                  | Modified | Phase 17                           |

## Risks

| Risk                           | Likelihood | Mitigation                                    |
| ------------------------------ | ---------- | --------------------------------------------- |
| Stack pushes action off-canvas | Low        | Keep gaps within VISUAL_SYSTEM spacing tokens |
| Settings regression            | Low        | Shared stack path + tests for both overlays   |

## Rollback Plan

Revert OverlayRenderer layout, UIRenderer Controls offset, related tests, and Phase 17 PLAN notes. Prefs/hotkeys unchanged.

## Dependencies

- Confirmed Phase 17 decisions from screenshot overlap analysis

## Success Criteria

- [ ] Pause preference lines and resume prompt have distinct, readable Y positions
- [ ] Settings prefs and close action do not overlap
- [ ] Stats Record does not visually collide with Controls header
- [ ] lint/test/format/build pass
