# Proposal: In-game controls help

## Intent

Keyboard controls are documented in fragmented UI fragments: a partial sidebar Controls list, a separate audio shortcut line, and short overlay prompts. First-time players cannot scan one trustworthy inventory. Consolidate discoverability without changing bindings or Tetris rules (PLAN.md Phase 15).

## Scope

### In Scope

- Shared controls-help copy contract covering every supported `InputController` binding (move, rotate, soft drop, pause/resume, music, sound, restart with game-over scope)
- Consolidated always-visible sidebar Controls block using that contract
- Move M/S shortcut docs into Controls; keep audio status indicators as status-only
- Keep start/pause/game-over overlays as short next-action prompts aligned with shared key vocabulary
- Focused Jest tests for help contract, sidebar rendering, overlay wording, and no binding changes
- Update PLAN.md Phase 15 status as work completes

### Out of Scope

- Remappable keys, touch gameplay pads, mobile redesign, ARIA/canvas a11y
- Hard drop, hold piece, or any new binding (including H-toggle help)
- Changing Phase 14 game-over score/best summary
- Coverage thresholds or deeper parked a11y work

## Capabilities

### New Capabilities

- `controls-help`: Shared binding inventory and persistent sidebar help surface; overlay actions stay short and vocabulary-aligned.

### Modified Capabilities

- None (game-over-overlay restart copy already matches; no requirement change unless wording drift is found)

## Approach

1. Add a small shared copy module (settings-adjacent) listing help lines used by the sidebar.
2. Drive `UIRenderer` Controls text from that module (play + audio + restart qualifier).
3. Remove duplicate `M: Music | S: Sound` shortcut line from `AudioIndicatorRenderer`; keep ON/OFF status.
4. Confirm overlay action strings already match vocabulary; adjust only if tests require alignment.
5. Strict TDD on focused UI/overlay/audio tests; leave `InputController` behavior unchanged.

## Affected Areas

| Area                                              | Impact   | Description                               |
| ------------------------------------------------- | -------- | ----------------------------------------- |
| `src/config/controlsHelp.js` (new)                | New      | Shared help line contract                 |
| `src/scenes/components/UIRenderer.js`             | Modified | Consume shared Controls list              |
| `src/scenes/components/AudioIndicatorRenderer.js` | Modified | Drop duplicate shortcut docs              |
| `src/scenes/components/OverlayRenderer.js`        | Modified | Only if action vocabulary needs alignment |
| `tests/UIRenderer.test.js`                        | Modified | Consolidated help assertions              |
| `tests/AudioIndicatorRenderer.test.js`            | Modified | No shortcut line; status remains          |
| `tests/OverlayRenderer.test.js`                   | Modified | Guard short overlay actions               |
| `tests/controlsHelp.test.js` (new)                | New      | Contract vs supported bindings            |
| `PLAN.md` Phase 15                                | Modified | Status notes / closeout                   |

## Risks

| Risk                                                     | Likelihood | Mitigation                                                        |
| -------------------------------------------------------- | ---------- | ----------------------------------------------------------------- |
| Sidebar crowding / overlap with audio status or feedback | Med        | Keep caption sizing; verify vertical offsets; trim wording        |
| Duplicate or conflicting M/S docs                        | Low        | Single shortcut home in Controls; status-only audio               |
| Accidental InputController change                        | Low        | No production edits to input; regression via existing scene tests |

## Rollback Plan

Revert the shared module, UIRenderer list, AudioIndicator shortcut removal, any overlay copy tweaks, and related tests. No persistence or logic migration.

## Dependencies

- Confirmed decisions: help-model, copy-contract, audio-split, restart-qualifier, bindings
- PLAN.md Phase 15; research unselected

## Success Criteria

- [ ] Persistent sidebar documents every supported keyboard action with shared copy
- [ ] Overlays remain short next-action prompts with matching key names
- [ ] Audio status indicators remain; shortcut docs are not duplicated there
- [ ] Input bindings and Tetris rules unchanged
- [ ] `npm run lint`, `npm test`, `npm run build` pass
