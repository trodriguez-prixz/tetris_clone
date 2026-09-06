# Project Improvement Plan

Phases **0–18 are complete**. This file is the compact source of truth for what shipped, what ownership looks like, and what remains parked. Detailed task history lives in git and `openspec/changes/archive/`.

## Status legend

- `[ ]` Not started
- `[~]` In progress
- `[x]` Done
- `[!]` Blocked

## Program status

| Track              | Phases | Outcome                                                                        |
| ------------------ | ------ | ------------------------------------------------------------------------------ |
| Architecture & ops | 0–8    | Testable domain, thin `GameScene`, tooling/CI, packaging, ownership docs       |
| UX / UI            | 9–18   | Arcade visuals, readable play UI, feedback, a11y polish, prefs, overlays, i18n |

**Verification baseline:** `npm run lint`, `npm test`, `npm run format:check`, `npm run build`.

**Agent guidance:** `AGENTS.md` (runtime layout, imports, test seams). **Behavior specs:** `openspec/specs/`.

## Phase overview

| Phase                                   | Status | Goal                                                                              |
| --------------------------------------- | ------ | --------------------------------------------------------------------------------- |
| 0. Refactor safety baseline             | `[x]`  | Protect current behavior before architecture changes.                             |
| 1. Game domain extraction               | `[x]`  | Keep Tetris rules testable without Phaser.                                        |
| 2. Scene orchestration cleanup          | `[x]`  | Make `GameScene` coordinate instead of owning every concern.                      |
| 3. Rendering and UI design boundaries   | `[x]`  | Separate visual layout from game rules.                                           |
| 4. Event communication cleanup          | `[x]`  | Make module communication explicit and consistent.                                |
| 5. Quality tooling                      | `[x]`  | Add minimal automated checks for safer maintenance.                               |
| 6. Platform and packaging verification  | `[x]`  | Preserve web, Express, and Electron delivery paths.                               |
| 7. Architecture documentation           | `[x]`  | Record the final structure and update agent guidance if needed.                   |
| 8. Formatting cleanup                   | `[x]`  | Make Prettier checks pass without mixing formatting with behavior changes.        |
| 9. UX/UI discovery baseline             | `[x]`  | Identify usability gaps before changing visuals or flows.                         |
| 10. Visual system refresh               | `[x]`  | Create a consistent arcade visual language for the game.                          |
| 11. Gameplay readability                | `[x]`  | Make board state, next pieces, score, and status easier to understand.            |
| 12. Interaction feedback and game feel  | `[x]`  | Improve player feedback without changing core Tetris rules.                       |
| 13. Accessibility and responsive polish | `[x]`  | Make the game more usable across devices and player needs.                        |
| 14. Game-over outcome clarity           | `[x]`  | Make the ended run’s result and restart path obvious without changing rules.      |
| 15. In-game controls help               | `[x]`  | Make keyboard controls discoverable from one coherent UI help surface.            |
| 16. Player preferences (Settings)       | `[x]`  | Persist ghost/audio prefs; Settings from start/pause; G/M/S hotkeys sync.         |
| 17. Overlay layout non-overlap          | `[x]`  | Fix pause/settings text collisions; modest Stats→Controls sidebar gap.            |
| 18. UI localization (EN/ES)             | `[x]`  | Persist locale; choose English/Spanish from Settings; translate player-facing UI. |

## Outcomes by track

### Architecture & ops (0–8)

| Phase | Shipped                                                                                                    |
| ----- | ---------------------------------------------------------------------------------------------------------- |
| 0     | Regression coverage for `GameState`, `GameStateMachine`, domain classes, and focused `GameScene` tests     |
| 1     | Pure rules in `src/logic/` + classes; Phaser/`EventBus` kept out of domain; explicit lifecycle transitions |
| 2     | Input, drop-loop, and audio as scene components; `GameScene` as coordinator                                |
| 3     | Layout/constants in `settings.js`; board/UI/overlays in `src/scenes/components/`                           |
| 4     | Central `GameEvents` names; named object payloads where needed                                             |
| 5     | ESLint, Prettier, CI (`lint` / `test` / `build` / `format:check`)                                          |
| 6     | Vite `base: './'`, Express `dist/`, Electron dev URL and packaged `dist/index.html` validated              |
| 7–8   | Ownership recorded; Prettier baseline green                                                                |

### UX / UI (9–18)

| Phase | Shipped                                                                         |
| ----- | ------------------------------------------------------------------------------- |
| 9     | Friction inventory for start / play / pause / game-over (historical baseline)   |
| 10    | Shared `VISUAL_SYSTEM` palette, type, spacing                                   |
| 11    | Clearer board, next, score, and status scanning                                 |
| 12    | Line-clear / lock / level / unavailable-action feedback without rule changes    |
| 13    | Control copy, caption contrast, fixed-canvas shell; deep a11y parked            |
| 14    | Game-over score + best outcome; `time` snapshot aligned; R + click restart      |
| 15    | Shared `controlsHelp` contract; sidebar Controls; short overlay prompts         |
| 16    | Persisted ghost/music/SFX; Esc Settings on start; pause toggles; G/M/S          |
| 17    | Non-overlapping pause/settings preference stack; Controls clearance under Stats |
| 18    | EN/ES catalogs + `t()`; prefs `locale`; Settings/`L`; live UI refresh           |

## Ownership (stable)

| Area                     | Owns                                                                                                                                                  | Does not own                                                                    |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `src/logic/`             | Board, spawn, move/collision, soft-drop, line clear, scoring triggers, game-over snapshots, state-machine transitions, plain domain event descriptors | Phaser, rendering, input APIs, audio, timers, storage, direct EventBus emission |
| `src/classes/`           | `Block`, `Tetramino`, `Score`                                                                                                                         | Scene orchestration, persistence, platform APIs                                 |
| `src/i18n/`              | Locale catalogs (`en`/`es`), `t()` / `setLocale` / `cycleLocale`                                                                                      | Phaser rendering, storage policy, Tetris rules                                  |
| `src/scenes/`            | Phaser composition; `GameScene` wires state, machine, components, storage, audio, input, timers, rendering, EventBus emission                         | Core Tetris rule ownership                                                      |
| `src/scenes/components/` | Board/effects, sidebar UI, preview, score, audio indicators, overlays, input, drop-loop                                                               | Pure rules, durable transitions, storage policy, event-name definitions         |
| `src/events/`            | `GameEvents.js` names; Phaser-backed `EventBus` singleton                                                                                             | Business decisions or ad hoc event names                                        |

## Specs & archives

| Spec / change                         | Path                                                                            |
| ------------------------------------- | ------------------------------------------------------------------------------- |
| Controls help                         | `openspec/specs/controls-help/`                                                 |
| Game-over overlay + stats contract    | `openspec/specs/game-over-overlay/`, `openspec/specs/game-over-stats-contract/` |
| Player preferences + settings overlay | `openspec/specs/player-preferences/`, `openspec/specs/settings-overlay/`        |
| UI localization                       | `openspec/specs/ui-localization/`                                               |
| SDD archives (14–18)                  | `openspec/changes/archive/2026-09-05-*`                                         |

## Parked follow-ups

Not open plan tasks unless explicitly reopened:

| Item                | Why it was a candidate                                      | Decision                                                                          |
| ------------------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Hard drop           | Common control; ghost + unused hard-drop sound exist        | Parked. Soft drop + Space=pause stay as-is.                                       |
| Coverage thresholds | CI could enforce a coverage %                               | Parked until scoped domain thresholds are justified.                              |
| Deeper a11y         | ARIA, touch play, remaps, true mobile layout, a11y settings | Parked. Phase 13 polish stands; canvas-semantic a11y is a larger separate effort. |

## Starting new work

1. Add a new phase row (or reopen a parked item) with objective, locked decisions, tasks, and exit criteria.
2. Prefer SDD under `openspec/changes/{change}/` when behavior needs specs; archive when done.
3. Keep implementation notes in PRs/commits — do not re-expand this file into a diary.
4. Preserve boundaries in the ownership table and `AGENTS.md`.

## Phase 18 — UI localization (EN/ES) `[x]`

**Objective:** Let players pick English or Spanish from Settings, persist the choice, and show all player-facing UI in that locale without changing Tetris rules or hotkey bindings.

**Shipped (2026-09-05)**

- `src/i18n/` catalogs + `t()`; preferences `locale` (default `en`)
- Settings/pause language line; hotkey `L`; `refreshLocalizedUI` for live update
- Overlays, Controls, Stats, audio status, feedback, game-over outcome localized
- Archived `openspec/changes/archive/2026-09-05-ui-localization-en-es/`; main spec `ui-localization`
- Verified: `npm test` (107), lint, format:check, build
