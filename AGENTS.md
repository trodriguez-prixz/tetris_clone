# Guía para agentes de IA

Este documento resume el contexto del proyecto **tetris-clone** y las reglas que deben seguir los asistentes al modificar o extender el código.

## Qué es este proyecto

Clon de Tetris en el navegador (y empaquetable como app de escritorio) con **Phaser 3**, lógica en **JavaScript** puro con **módulos ES** (`"type": "module"` en `package.json`).

## Stack principal

| Área | Tecnología |
|------|------------|
| Motor de juego | Phaser 3 (física Arcade) |
| Bundler / dev server | Vite 5 (`base: './'`, puerto **3000**) |
| Tests | Jest + jsdom + Babel (`babel-jest`) |
| Despliegue web | Express sirviendo `dist/` (Heroku vía `Procfile`) |
| Escritorio | Electron + electron-builder |

**Node.js:** 18 o superior (según README).

## Estructura de directorios

```
src/
  config/settings.js    # Constantes del juego, grid, tetraminós, canvas
  classes/              # Block, Tetramino, Score (lógica de dominio + objetos Phaser)
  scenes/               # GameScene (escena principal)
  utils/                # timer, audio (retroMusic, soundEffects), storage
  main.js               # Entrada: crea Phaser.Game y registra escenas
tests/                  # *.test.js; mock de Phaser en tests/__mocks__/phaser.js
electron/main.cjs       # Ventana Electron (CommonJS; .cjs por "type": "module")
server.js               # Express para producción
index.html              # Raíz del proyecto (Vite); `lang="es"`
```

La documentación detallada de arquitectura y controles está en `README.md`.

## Convenciones de código

- **Módulos ES:** `import` / `export`; en el código de aplicación **incluir la extensión** en las rutas (p. ej. `'./Block.js'`, `'../config/settings.js'`).
- **Exports:** clases con `export default class …`; utilidades según encaje (default o named).
- **Nombres de archivo:** `PascalCase` para escenas y clases de juego (`GameScene.js`, `Tetramino.js`); `camelCase` para utilidades (`timer.js`, `soundEffects.js`).
- **Comentarios en el código:** en **inglés**, alineados con el estilo actual (comentarios breves sobre intención o rendimiento).
- **Configuración centralizada:** dimensiones, colores de piezas, constantes de rejilla y UI van en `src/config/settings.js`; evitar números mágicos dispersos.
- **Phaser en tests:** Jest mapea `phaser` al mock en `tests/__mocks__/phaser.js`. Si el código usa APIs nuevas de Phaser en tests, puede ser necesario ampliar ese mock.
- **Alias `@/`:** definido solo en Jest (`moduleNameMapper` → `src/`). El código fuente en Vite usa rutas relativas; no asumir que `@/` funciona en el bundle sin añadirlo a `vite.config.js`.

## Scripts útiles

- `npm run dev` — desarrollo con Vite.
- `npm run build` — salida en `dist/`.
- `npm test` / `npm run test:watch` — tests.
- `npm run electron` — Electron en dev (espera Vite en `:3000`).
- Builds de escritorio: `npm run build:electron:mac` / `:linux` (tras `npm run build`).

## Cobertura y exclusiones (Jest)

`collectCoverageFrom` excluye `src/main.js` y `src/utils/retroMusic.js`. Tenerlo en cuenta al valorar cobertura.

## Reglas globales para cambios

1. **Alcance mínimo:** cambiar solo lo necesario para la tarea; no refactorizar masivamente ni tocar archivos no relacionados.
2. **Consistencia:** imitar el estilo existente (imports, nombres, organización por carpetas).
3. **Tests:** al modificar lógica en `classes/`, `utils/` o comportamiento relevante en escenas, añadir o actualizar tests en `tests/` y ejecutar `npm test`.
4. **Documentación:** no crear ni editar `README.md` u otros `.md` salvo que el usuario lo pida explícitamente.
5. **Electron:** el proceso principal es `electron/main.cjs` (**CommonJS** con `require`) porque `"type": "module"` fuerza ESM en `.js`; el resto del proyecto es ESM.
6. **Despliegue:** producción sirve `dist/`; cualquier recurso nuevo debe incluirse en el flujo de `vite build`.

## Idioma

- Mensajes al usuario y documentación de producto pueden estar en **español** (como el README).
- Comentarios en código fuente: **inglés**, como en el repositorio actual.
