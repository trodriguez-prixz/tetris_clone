# AGENTS.md

## Project shape

- Browser Tetris clone using Phaser 3, Vite 5, Jest/jsdom, Express, and Electron.
- Runtime is ES modules because `package.json` sets `"type": "module"`; only `electron/main.cjs` is CommonJS.
- Vite entry: `index.html` -> `/src/main.js` -> `GameScene`.
- Production web serving: `Procfile` runs `node server.js`, which serves `dist/` and falls back to `dist/index.html`.
- Electron dev expects Vite at `http://localhost:3000`; packaged Electron loads `dist/index.html`.

## High-value paths

- `src/config/settings.js` — grid, canvas, tetraminos, colors, scoring, timing constants.
- `src/classes/` — small pure domain models: `Block`, `Tetramino`, and `Score`.
- `src/logic/` — pure gameplay flow/rules, state transitions, and plain domain event descriptors; no Phaser, rendering, timers, audio, storage, or EventBus emission.
- `src/events/` — shared event contract (`GameEvents.js`) and Phaser-backed singleton bus (`EventBus.js`).
- `src/scenes/GameScene.js` — Phaser runtime orchestration: state wiring, storage, audio, input, timers, rendering updates, and domain-event emission.
- `src/scenes/components/` — Phaser-facing collaborators for rendering/effects, UI, overlays, input, audio control, and drop-loop timers; no durable game rules or event-name definitions.
- `tests/__mocks__/phaser.js` and `tests/setup.js` — Phaser/browser API mocks for Jest.

## Commands

- Install: `npm install`
- Dev server: `npm run dev` (Vite opens port 3000)
- Unit tests: `npm test`
- Watch tests: `npm run test:watch`
- Lint: `npm run lint`
- Format check/write: `npm run format:check` / `npm run format`
- Build web app: `npm run build`
- Electron dev: run `npm run dev` first, then `NODE_ENV=development npm run electron` if you need the dev URL path.
- Electron package: run `npm run build` first, then `npm run build:electron:mac` or `npm run build:electron:linux`.

## Toolchain quirks

- Vite config uses `base: './'` and outputs to `dist/`; keep this for Electron/static hosting.
- Vite manually chunks Phaser as `phaser`; avoid changing bundling unless fixing build output.
- Jest uses `babel-jest`, `testEnvironment: 'jsdom'`, and `tests/setup.js` before tests.
- Jest maps `phaser` to `tests/__mocks__/phaser.js`; add mock APIs there when production code uses new Phaser APIs.
- Jest maps `@/` to `src/`, but Vite does not. Do not use `@/` imports in application source.
- Coverage excludes `src/main.js` and `src/utils/retroMusic.js`.
- CI runs on Node 20 with `npm ci`, `npm run lint`, `npm test`, and `npm run build`.
- Prettier ignores `.atl/` and `package-lock.json`; do not use formatter output to rewrite those files.
- No typecheck or pre-commit config is currently present.

## Code rules

- Use relative ES module imports with explicit `.js` extensions in `src/`.
- Keep game constants and layout numbers in `src/config/settings.js`; avoid scattering magic numbers.
- Keep EventBus names centralized in `src/events/GameEvents.js`; non-empty gameplay payloads use named object fields such as `{ rows }`, `{ stats }`, or `{ level }`.
- Keep code comments in English and focused on intent or non-obvious behavior.
- Preserve CommonJS in `electron/main.cjs`; do not convert it to ESM.
- Add or update Jest tests when changing `src/classes/`, `src/logic/`, `src/utils/`, or scene behavior.
- Keep documentation edits out of scope unless explicitly requested; this file is the repo instruction exception.

## Testing focus

- Use focused test files when iterating, e.g. `npm test -- tests/GameScene.test.js`.
- If changing scene rendering/input behavior, check `tests/GameScene.test.js` and Phaser mocks together.
- If changing browser/audio/storage behavior, update `tests/setup.js` mocks as needed.
