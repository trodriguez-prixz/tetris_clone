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
| 0. Refactor safety baseline | `[x]` | Protect current behavior before architecture changes. |
| 1. Game domain extraction | `[x]` | Keep Tetris rules testable without Phaser. |
| 2. Scene orchestration cleanup | `[x]` | Make `GameScene` coordinate instead of owning every concern. |
| 3. Rendering and UI design boundaries | `[x]` | Separate visual layout from game rules. |
| 4. Event communication cleanup | `[x]` | Make module communication explicit and consistent. |
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

- [x] `npm test` passes.
- [x] Focused scene tests can run with `npm test -- tests/GameScene.test.js`.
- [x] Main gameplay behavior is protected before structural refactors begin.

## Phase 1 — Game domain extraction

**Objective:** Keep the Tetris rules in pure logic modules that can be tested without Phaser.

**Tasks**

- [x] Identify rule logic currently coupled to `GameScene`.
- [x] Move board state, collision, rotation, line clearing, scoring, and falling behavior into `src/logic/` or existing domain classes.
  - 2026-07-03: Extracted soft-drop mode and speed selection into `GameState`; `GameScene` still owns Phaser timer restart and input/rendering reactions. Remaining slices include fall tick result wrapping, start/restart transitions, and game-over stats snapshot.
  - 2026-07-03: Added a `GameState.updateTick()` result wrapper for fall ticks (`moved`, `locked`, `spawned`, `gameOver`) and routed `GameScene` rendering through that result; task remains partial for start/restart transitions and game-over stats snapshot.
  - 2026-07-03: Added `GameState.startGame()` for score-timer/start-spawn setup and `GameStateMachine.restart()`/`markGameOver()` so restart no longer mutates `currentState` directly; task remains partial for game-over stats snapshot.
  - 2026-07-03: Added `GameState.getGameOverStatsSnapshot()` to finalize elapsed time and expose serializable game-over score stats while keeping storage persistence in `GameScene`; task 2 is complete.
- [x] Keep Phaser-specific objects out of core rule modules.
  - 2026-07-03: Removed direct dependency on the Phaser-backed `EventBus` from core rule modules. `GameState` and `GameStateMachine` now record plain domain event descriptors for the scene/infrastructure layer to emit, and a regression test locks the Phaser boundary.
- [x] Ensure `GameState` and `GameStateMachine` expose clear state transitions.
  - 2026-07-03: Made `GameStateMachine` state private, routed lifecycle changes through a named transition helper, returned explicit transition result objects, and kept `start()` limited to the start screen while `restart()` owns game-over restarts.
- [x] Update tests alongside each extraction.

**Rule-coupling inventory**

| Area in `GameScene` | Current coupling | Proposed extraction target/order |
|---------------------|------------------|----------------------------------|
| Input repeat gates | Horizontal move and rotation throttles live in scene time checks (`horizontalMoveDelay`, `rotateDelay`, `lastMoveTime`, `lastRotateTime`). | 1. Extract input intent/rate decisions after preserving scene input behavior. |
| Soft drop behavior | Down key directly mutates `gameState.dropSpeed`, restarts the Phaser timer, and tracks `isFastDrop`. | 2. Move drop-mode state and speed selection behind logic methods; scene keeps timer wiring. |
| Fall tick orchestration | Scene timer callback decides when to call `gameState.updateTick()` and render. | 3. Keep Phaser timer in scene, but route falling intent through a clear logic transition/result. |
| Start/restart spawn flow | Scene starts score timer, spawns the first tetramino, resets score/UI state, and manually sets machine state on restart. | 4. Add explicit start/restart transitions in logic/state machine; scene reacts to results. |
| Game-over persistence boundary | Scene reads score stats and decides high-score/statistics updates immediately after game over. | 5. Keep storage in scene/platform layer, but expose a stable game-over stats snapshot from logic. |

Existing pure-rule homes: board occupancy, collision, rotation, line clearing, scoring, level speed updates, and piece locking already primarily live in `GameState`, `Tetramino`, and `Score`. Future extraction should avoid moving Phaser rendering, keyboard APIs, audio, storage APIs, or timers into rule modules.

**Exit criteria**

- [x] Core game rules can be tested without constructing a Phaser scene.
- [x] `GameScene` delegates rule decisions to logic/domain modules.
- [x] `npm test` passes.

## Phase 2 — Scene orchestration cleanup

**Objective:** Reduce `GameScene` to a readable coordinator for lifecycle, rendering, input, audio, and events.

**Tasks**

- [x] Split input handling into a dedicated helper or scene component.
- [x] Split timer/drop-loop coordination into a dedicated helper or scene component.
- [x] Split audio coordination from gameplay decisions.
- [x] Keep scene lifecycle methods short and intention-revealing.
  - 2026-07-03: Extracted small orchestration helpers for `GameScene` create/update/start/pause/game-over/restart flows so lifecycle methods describe intent without moving responsibilities to new components.
- [x] Remove duplicated state derivation from `GameScene` where domain state already exists.
  - 2026-07-03: Moved the start-input pause guard into `InputController` and stopped mirroring the restart key on `GameScene`; verified overlay arrays remain scene-owned until rendering/UI boundaries are addressed in Phase 3.

**Exit criteria**

- [x] `GameScene` mostly wires collaborators together.
- [x] Gameplay decisions remain in logic/domain modules.
- [x] Scene behavior tests still pass.

## Phase 3 — Rendering and UI design boundaries

**Objective:** Make visual changes safe by isolating rendering and layout from game rules.

**Tasks**

- [x] Consolidate grid, canvas, color, scoring, and timing constants in `src/config/settings.js`.
- [x] Remove or justify magic numbers in rendering components.
  - 2026-07-03: Added shared rendered-block inset and panel-border width constants, named board particle/animation details locally, and grouped UI/overlay text and animation layout constants without moving overlay ownership.
- [x] Keep board rendering, active piece rendering, score display, preview, and overlays separated in `src/scenes/components/`.
  - 2026-07-03: Moved start/pause/game-over overlays into `OverlayRenderer` and split sidebar score, preview, and audio indicator rendering behind focused components while keeping `GameScene` as coordinator.
- [x] Keep code comments in English and focused on intent or non-obvious behavior.
  - 2026-07-03: Removed noisy rendering/settings comments and kept only intent-focused comments for non-obvious tetramino pivots and cleared-row animation behavior.

**Exit criteria**

- [x] Visual layout can change without editing core gameplay rules.
- [x] Rendering components have clear ownership.
- [x] `npm test` passes.

## Phase 4 — Event communication cleanup

**Objective:** Make communication between logic, scene, UI, and audio explicit.

**Tasks**

- [x] Review `src/events/EventBus.js` for event names and payload consistency.
  - 2026-07-03: Removed unused `PIECE_PLACED` and `HARD_DROP` constants from `GameEvents`. Active events now match current producers/consumers: lifecycle events use no payload, preview/game-over use no payload, `LINES_CLEARED` uses row indexes, `TETRAMINO_LOCKED` uses locked block objects, `SCORE_UPDATED` uses score stats, and `LEVEL_UP` uses the new level number.
- [x] Centralize any remaining ad hoc event names.
  - 2026-07-03: Verified EventBus producers/consumers and domain `recordEvent` calls in `src/` and `tests/`; game-domain events already use `EVENTS` constants. Remaining string event names are Phaser input/API events or the explicit `GameEvents` inventory test.
- [x] Define predictable payload shapes for important events.
  - 2026-07-03: Non-empty gameplay event payloads now use named object fields: `LINES_CLEARED` emits `{ rows }`, `TETRAMINO_LOCKED` emits `{ blocks }`, `SCORE_UPDATED` emits `{ stats }`, and `LEVEL_UP` emits `{ level }`. Lifecycle, preview, and game-over events remain no-payload (`undefined`) because consumers do not need event data.
- [x] Remove event flows that duplicate direct state reads without adding value.
  - 2026-07-03: Removed `TETRAMINO_LOCKED` because its only EventBus consumer ignored `{ blocks }`, and removed `NEXT_SHAPE_UPDATED` because preview rendering already reads `gameState.nextShapes` directly from scene coordination after spawns. Retained lifecycle, line-clear, score, and level events because they decouple scene/audio/UI effects or carry payloads used by consumers.

**Exit criteria**

- [x] Event names are discoverable from one place.
- [x] Event payloads are consistent enough for tests and future changes.
- [x] No hidden gameplay rule decisions live only in event handlers.

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
| 2026-07-03 | Phase 3 task 4 completed by pruning stale/noisy rendering comments; focused scene tests and full `npm test` pass, closing Phase 3 exit criteria. |
| 2026-07-03 | Phase 3 task 3 completed by moving overlays out of `GameScene` and separating sidebar score, preview, and audio indicator rendering into focused scene components; Phase 3 task 4 and exit criteria remain open. |
| 2026-07-03 | Phase 3 task 2 completed by naming shared rendering measurements and local visual-effect/layout details in `GameScene`, `BoardRenderer`, and `UIRenderer`; Phase 3 task 3/4 and exit criteria remain open. |
| 2026-07-03 | Phase 3 task 1 completed by consolidating shared color, preview-cell, elapsed-time, and input timing constants into `src/config/settings.js`; Phase 3 task 2/3/4 and exit criteria remain open. |
| 2026-07-03 | Phase 2 task 5 completed by removing duplicated start/restart input state from `GameScene`; focused scene tests and full `npm test` pass, closing Phase 2 exit criteria. |
| 2026-07-03 | Phase 1 task 5 completed by verifying updated `GameState`, `GameStateMachine`, `GameScene`, and Phaser boundary tests; focused Phase 1 tests and full `npm test` pass, closing Phase 1 exit criteria. |
| 2026-07-03 | Phase 1 task 4 completed by making lifecycle transitions explicit through `GameStateMachine` result objects and removing external direct state mutation seams from production/tests. |
| 2026-07-03 | Phase 1 task 3 completed by moving core rule modules off the Phaser-backed `EventBus`; `EventBus` remains an infrastructure boundary used by scene/rendering code. |
| 2026-07-03 | Phase 1 task 2 completed with a stable game-over stats snapshot exposed from `GameState`; Phase 1 task 3/4/5 remain not started. |
| 2026-07-03 | Phase 1 task 2 started with a safe soft-drop extraction into `GameState`; task remains partially complete. |
| 2026-07-02 | Initial plan created from the latest architecture improvement plan. |
