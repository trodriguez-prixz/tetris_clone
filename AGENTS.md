# AI Agents Guide 🤖

This document summarizes the context of the **tetris-clone** project and the critical rules that AI assistants must follow when modifying or extending the code.

> [!IMPORTANT]
> **Always read this document before planning or executing any changes.**

## 🎮 What is this project

A Tetris clone in the browser (and packable as a desktop app) built with **Phaser 3**. The game logic is written in pure **JavaScript** with **ES modules** (`"type": "module"` in `package.json`).

## 🛠 Main Stack

| Area | Technology |
|------|------------|
| **Game Engine** | Phaser 3 (Arcade physics) |
| **Bundler / Server** | Vite 5 (`base: './'`, port **3000**) |
| **Tests** | Jest + jsdom + Babel (`babel-jest`) |
| **Web Deployment** | Express serving `dist/` (Heroku via `Procfile`) |
| **Desktop Build** | Electron + electron-builder |
| **Runtime** | Node.js 18 or higher |

## 📁 Directory Structure

```text
src/
  ├── config/settings.js    # Game constants, grid sizes, tetraminos, UI config
  ├── classes/              # Core domain logic + Phaser objects (Block, Tetramino, Score)
  ├── scenes/               # Phaser Scenes (e.g., GameScene)
  ├── utils/                # Helpers: timer, audio (retroMusic, soundEffects), storage
  └── main.js               # Entry point: creates Phaser.Game and registers scenes
tests/                      # Jest tests (*.test.js) & __mocks__
electron/
  └── main.cjs              # Electron shell (CommonJS)
server.js                   # Express server for production deployment
index.html                  # Project root (Vite entry point); `lang="es"`
```

> [!NOTE]
> Detailed documentation of the game architecture and controls is in `README.md`.

## ✍️ Coding Conventions

- **ES Modules:** Use `import` / `export`. In application code, **always include the file extension** in paths (e.g., `import Block from './Block.js'`).
- **Exports:** Export classes using `export default class ...`. Utilities can use default or named exports depending on fit.
- **Naming:** 
  - `PascalCase` for scenes and game classes (e.g., `GameScene.js`, `Tetramino.js`).
  - `camelCase` for utilities (e.g., `timer.js`, `soundEffects.js`).
- **Configuration:** Dimensions, piece colors, grid constants, and UI coordinates go in `src/config/settings.js`. **Avoid scattered magic numbers.**
- **Path Aliases:** `@/` is defined **only in Jest** (`moduleNameMapper` → `src/`). Source code bundled by Vite must use relative paths. **Do not use `@/` inside `src/`**.

## 🧪 Testing (Jest)

- **Phaser Mocks:** Jest maps `phaser` to the mock in `tests/__mocks__/phaser.js`. If you use new Phaser APIs, you might need to update this mock.
- **Coverage Exclusions:** `src/main.js` and `src/utils/retroMusic.js` are excluded from test coverage. Keep this in mind when evaluating coverage metrics.

## 🚀 Useful Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with Vite |
| `npm run build` | Build the web application to `dist/` |
| `npm test` | Run Jest tests once |
| `npm run test:watch` | Run Jest tests in watch mode |
| `npm run electron` | Start Electron in dev mode (requires Vite running on `:3000`) |
| `npm run build:electron:mac` | Build macOS executable (run `npm run build` first) |
| `npm run build:electron:linux`| Build Linux executable (run `npm run build` first) |

## 🚨 Global Rules for AI Assistants

> [!WARNING]
> Please adhere strictly to the following rules when proposing or making changes.

1. **Minimum Scope:** Change only what is necessary for the task. Do not perform massive refactors or touch unrelated files.
2. **Consistency First:** Imitate the existing coding style, imports style, and folder organization.
3. **Write Tests:** When modifying logic in `classes/`, `utils/`, or behavior in `scenes/`, always add or update corresponding Jest tests and ensure they pass.
4. **Hands-off Documentation:** Do not create or edit `README.md` or other Markdown documentation files unless explicitly requested by the user.
5. **Electron CommonJS:** The main Electron process (`electron/main.cjs`) uses CommonJS (`require`). Do not use ESM (`import`/`export`) there, as `"type": "module"` in `package.json` forces ESM only for standard `.js` files.
6. **Deployment:** Production serves the `dist/` folder via Express. Any new static asset must be included in the Vite build workflow.

## 🗣 Language Guidelines

- **Communication:** Messages to the user and product documentation may be in **Spanish** or **English**.
- **Code Comments:** Base code comments must be written in **English**, maintaining the current repository style. Keep comments brief and focused on intent or performance.
