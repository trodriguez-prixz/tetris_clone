# AI Agents Guide

This document summarizes the context of the **tetris-clone** project and the rules that assistants must follow when modifying or extending the code.

## What is this project

Tetris clone in the browser (and packable as a desktop app) using **Phaser 3**, logic in pure **JavaScript** with **ES modules** (`"type": "module"` in `package.json`).

## Main Stack

| Area | Technology |
|------|------------|
| Game engine | Phaser 3 (Arcade physics) |
| Bundler / dev server | Vite 5 (`base: './'`, port **3000**) |
| Tests | Jest + jsdom + Babel (`babel-jest`) |
| Web deployment | Express serving `dist/` (Heroku via `Procfile`) |
| Desktop | Electron + electron-builder |

**Node.js:** 18 or higher (according to README).

## Directory structure

```
src/
  config/settings.js    # Game constants, grid, tetraminos, canvas
  classes/              # Block, Tetramino, Score (domain logic + Phaser objects)
  scenes/               # GameScene (main scene)
  utils/                # timer, audio (retroMusic, soundEffects), storage
  main.js               # Entry point: creates Phaser.Game and registers scenes
tests/                  # *.test.js; Phaser mock in tests/__mocks__/phaser.js
electron/main.cjs       # Electron window (CommonJS; .cjs because of "type": "module")
server.js               # Express for production
index.html              # Project root (Vite); `lang="es"`
```

Detailed documentation of architecture and controls is in `README.md`.

## Coding conventions

- **ES Modules:** `import` / `export`; in application code **include the extension** in paths (e.g. `'./Block.js'`, `'../config/settings.js'`).
- **Exports:** classes with `export default class ...`; utilities depending on fit (default or named).
- **File names:** `PascalCase` for scenes and game classes (`GameScene.js`, `Tetramino.js`); `camelCase` for utilities (`timer.js`, `soundEffects.js`).
- **Code comments:** in **English**, aligned with the current style (brief comments about intent or performance).
- **Centralized configuration:** dimensions, piece colors, grid constants and UI go in `src/config/settings.js`; avoid scattered magic numbers.
- **Phaser in tests:** Jest maps `phaser` to the mock in `tests/__mocks__/phaser.js`. If the code uses new Phaser APIs in tests, it might be necessary to expand that mock.
- **`@/` Alias:** defined only in Jest (`moduleNameMapper` → `src/`). Source code in Vite uses relative paths; do not assume `@/` works in the bundle without adding it to `vite.config.js`.

## Useful scripts

- `npm run dev` — development with Vite.
- `npm run build` — output to `dist/`.
- `npm test` / `npm run test:watch` — tests.
- `npm run electron` — Electron in dev (waits for Vite on `:3000`).
- Desktop builds: `npm run build:electron:mac` / `:linux` (after `npm run build`).

## Test Coverage and exclusions (Jest)

`collectCoverageFrom` excludes `src/main.js` and `src/utils/retroMusic.js`. Keep this in mind when evaluating coverage.

## Global rules for changes

1. **Minimum scope:** change only what is necessary for the task; do not refactor massively or touch unrelated files.
2. **Consistency:** imitate the existing style (imports, names, folder organization).
3. **Tests:** when modifying logic in `classes/`, `utils/`, or relevant behavior in scenes, add or update tests in `tests/` and run `npm test`.
4. **Documentation:** do not create or edit `README.md` or other `.md` files unless explicitly requested by the user.
5. **Electron:** the main process is `electron/main.cjs` (**CommonJS** with `require`) because `"type": "module"` forces ESM in `.js`; the rest of the project is ESM.
6. **Deployment:** production serves `dist/`; any new resource must be included in the `vite build` workflow.

## Language

- Messages to the user and product documentation may be in **Spanish** (like the README) or English.
- Source code comments: **English**, as in the current repository.
