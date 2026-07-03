# Architecture Improvement Plan

This plan is the single source of truth for improving the project's architecture and design. Update the status markers as work progresses.

## Status legend

- `[ ]` Not started
- `[~]` In progress
- `[x]` Done
- `[!]` Blocked

## Phase overview

| Phase | Status | Goal |
|-------|--------|------|
| 0. Refactor safety baseline | `[ ]` | Protect current behavior before architecture changes. |
| 1. Game domain extraction | `[ ]` | Keep Tetris rules testable without Phaser. |
| 2. Scene orchestration cleanup | `[ ]` | Make `GameScene` coordinate instead of owning every concern. |
| 3. Rendering and UI design boundaries | `[ ]` | Separate visual layout from game rules. |
| 4. Event communication cleanup | `[ ]` | Make module communication explicit and consistent. |
| 5. Quality tooling | `[ ]` | Add minimal automated checks for safer maintenance. |
| 6. Platform and packaging verification | `[ ]` | Preserve web, Express, and Electron delivery paths. |
| 7. Architecture documentation | `[ ]` | Record the final structure and update agent guidance if needed. |

## Phase 0 — Refactor safety baseline

**Objective:** Freeze important current behavior before moving responsibilities across files.

**Tasks**

- [x] Add or strengthen regression tests for `src/logic/GameState.js`.
- [x] Add or strengthen regression tests for `src/logic/GameStateMachine.js`.
- [x] Cover core behavior in `src/classes/Tetramino.js` and `src/classes/Score.js`.
- [x] Add focused coverage for important `src/scenes/GameScene.js` behavior.
- [x] Update `tests/__mocks__/phaser.js` or `tests/setup.js` if new test seams need browser or Phaser APIs.

**Exit criteria**

- [ ] `npm test` passes.
- [ ] Focused scene tests can run with `npm test -- tests/GameScene.test.js`.
- [ ] Main gameplay behavior is protected before structural refactors begin.

## Phase 1 — Game domain extraction

**Objective:** Keep the Tetris rules in pure logic modules that can be tested without Phaser.

**Tasks**

- [ ] Identify rule logic currently coupled to `GameScene`.
- [ ] Move board state, collision, rotation, line clearing, scoring, and falling behavior into `src/logic/` or existing domain classes.
- [ ] Keep Phaser-specific objects out of core rule modules.
- [ ] Ensure `GameState` and `GameStateMachine` expose clear state transitions.
- [ ] Update tests alongside each extraction.

**Exit criteria**

- [ ] Core game rules can be tested without constructing a Phaser scene.
- [ ] `GameScene` delegates rule decisions to logic/domain modules.
- [ ] `npm test` passes.

## Phase 2 — Scene orchestration cleanup

**Objective:** Reduce `GameScene` to a readable coordinator for lifecycle, rendering, input, audio, and events.

**Tasks**

- [ ] Split input handling into a dedicated helper or scene component.
- [ ] Split timer/drop-loop coordination into a dedicated helper or scene component.
- [ ] Split audio coordination from gameplay decisions.
- [ ] Keep scene lifecycle methods short and intention-revealing.
- [ ] Remove duplicated state derivation from `GameScene` where domain state already exists.

**Exit criteria**

- [ ] `GameScene` mostly wires collaborators together.
- [ ] Gameplay decisions remain in logic/domain modules.
- [ ] Scene behavior tests still pass.

## Phase 3 — Rendering and UI design boundaries

**Objective:** Make visual changes safe by isolating rendering and layout from game rules.

**Tasks**

- [ ] Consolidate grid, canvas, color, scoring, and timing constants in `src/config/settings.js`.
- [ ] Remove or justify magic numbers in rendering components.
- [ ] Keep board rendering, active piece rendering, score display, preview, and overlays separated in `src/scenes/components/`.
- [ ] Keep code comments in English and focused on intent or non-obvious behavior.

**Exit criteria**

- [ ] Visual layout can change without editing core gameplay rules.
- [ ] Rendering components have clear ownership.
- [ ] `npm test` passes.

## Phase 4 — Event communication cleanup

**Objective:** Make communication between logic, scene, UI, and audio explicit.

**Tasks**

- [ ] Review `src/events/EventBus.js` for event names and payload consistency.
- [ ] Centralize any remaining ad hoc event names.
- [ ] Define predictable payload shapes for important events.
- [ ] Remove event flows that duplicate direct state reads without adding value.

**Exit criteria**

- [ ] Event names are discoverable from one place.
- [ ] Event payloads are consistent enough for tests and future changes.
- [ ] No hidden gameplay rule decisions live only in event handlers.

## Phase 5 — Quality tooling

**Objective:** Add lightweight project checks without derailing the architecture work.

**Tasks**

- [ ] Add a formatter configuration.
- [ ] Add a linter configuration.
- [ ] Add a simple CI workflow that runs install, tests, and build.
- [ ] Decide whether coverage thresholds are useful after the safety baseline exists.

**Exit criteria**

- [ ] Contributors have a documented verification path.
- [ ] CI catches broken tests or builds.
- [ ] Tooling does not conflict with Vite, Jest, Express, or Electron packaging.

## Phase 6 — Platform and packaging verification

**Objective:** Ensure architecture changes do not break delivery targets.

**Tasks**

- [ ] Verify Vite still builds with `base: './'`.
- [ ] Verify Express still serves `dist/` through `server.js` and `Procfile`.
- [ ] Verify Electron dev still expects Vite at `http://localhost:3000`.
- [ ] Verify packaged Electron still loads `dist/index.html`.

**Exit criteria**

- [ ] `npm run build` succeeds.
- [ ] Web production serving assumptions remain valid.
- [ ] Electron dev/package assumptions remain valid.

## Phase 7 — Architecture documentation

**Objective:** Preserve the final architecture decisions for future sessions and contributors.

**Tasks**

- [ ] Document the final ownership of `src/logic/`, `src/classes/`, `src/scenes/`, `src/scenes/components/`, and `src/events/`.
- [ ] Update `AGENTS.md` if new repo-specific rules or gotchas were introduced.
- [ ] Keep documentation compact and focused on facts future agents would likely miss.

**Exit criteria**

- [ ] Architecture notes match the implemented code.
- [ ] Future work can start from this plan and `AGENTS.md` without rediscovering core constraints.

## Progress notes

Use this section for short dated updates. Keep detailed implementation notes in the relevant PR or commit.

| Date | Update |
|------|--------|
| 2026-07-02 | Initial plan created from the latest architecture improvement plan. |
