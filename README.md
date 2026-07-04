# Tetris Clone

Un clon completo de Tetris implementado con JavaScript, Phaser 3, Vite, Express y Electron.

## Características

- Mecánica completa de Tetris con 7 piezas: T, L, J, O, I, S y Z.
- Sistema de puntuación, niveles y aumento de velocidad cada 10 líneas.
- Vista previa de las próximas 3 piezas.
- Aceleración de caída con la flecha abajo.
- Pantallas de inicio, pausa y Game Over.
- Música retro de fondo y efectos de sonido independientes.
- Soporte para navegador, servidor Express de producción y empaquetado con Electron.

## Requisitos

- Node.js 18+ para desarrollo local.
- Node.js 20 en CI.
- npm.

## Instalación

```bash
npm install
```

## Comandos principales

| Tarea                  | Comando                |
| ---------------------- | ---------------------- |
| Servidor de desarrollo | `npm run dev`          |
| Tests                  | `npm test`             |
| Tests en watch mode    | `npm run test:watch`   |
| Lint                   | `npm run lint`         |
| Verificar formato      | `npm run format:check` |
| Aplicar formato        | `npm run format`       |
| Build web              | `npm run build`        |
| Preview del build      | `npm run preview`      |

El servidor de desarrollo de Vite usa `http://localhost:3000`.

> Nota: `npm run format:check` existe, pero puede fallar hasta que se haga una pasada dedicada de formato.

## Plataformas

### Web con Vite

```bash
npm run dev
npm run build
```

Vite usa `base: './'` para que los assets funcionen tanto en hosting estático como en Electron. El build se genera en `dist/`.

### Producción web con Express

```bash
npm run build
node server.js
```

El `Procfile` ejecuta `node server.js`. El servidor Express sirve `dist/` y hace fallback a `dist/index.html` para rutas de la SPA.

### Escritorio con Electron

Para desarrollo con Electron, primero levanta Vite:

```bash
npm run dev
NODE_ENV=development npm run electron
```

En desarrollo, Electron carga `http://localhost:3000`. En una app empaquetada, carga `dist/index.html`.

Para generar paquetes:

```bash
npm run build
npm run build:electron:mac
npm run build:electron:linux
```

Los artefactos se generan en `dist-electron/`.

## Controles

- **Flecha Izquierda (←)**: mover pieza a la izquierda.
- **Flecha Derecha (→)**: mover pieza a la derecha.
- **Flecha Arriba (↑)**: rotar pieza.
- **Flecha Abajo (↓)**: acelerar caída.
- **P o Espacio**: pausar o reanudar juego.
- **M**: silenciar o activar música.
- **S**: silenciar o activar efectos de sonido.
- **R**: reiniciar juego en Game Over.
- **Cualquier tecla o clic**: comenzar juego desde la pantalla de inicio.

## Reglas de juego

### Puntuación

| Líneas eliminadas | Puntos       |
| ----------------- | ------------ |
| 1 línea           | 40 × nivel   |
| 2 líneas          | 100 × nivel  |
| 3 líneas          | 300 × nivel  |
| 4 líneas          | 1200 × nivel |

Cada 10 líneas completadas aumenta el nivel y la velocidad de caída.

### Aceleración de caída

- Al presionar la flecha abajo, la pieza se mueve inmediatamente una vez.
- Mientras se mantiene presionada, la pieza cae más rápido.
- Al soltarla, la velocidad vuelve a la normal.

### Game Over

El juego termina cuando una nueva pieza no puede generarse en la parte superior de la cuadrícula porque el espacio está ocupado por bloques ya asentados.

## Arquitectura actual

La lógica del juego está separada de Phaser. `GameScene` coordina el runtime y delega reglas, renderizado, audio, entrada y timers a módulos enfocados.

| Área                       | Responsabilidad                                                                                                                                                |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/config/settings.js`   | Constantes de grilla, canvas, piezas, colores, puntuación y tiempos.                                                                                           |
| `src/classes/`             | Modelos puros de dominio: `Block`, `Tetramino` y `Score`.                                                                                                      |
| `src/logic/`               | Reglas y flujo de juego puros: estado de tablero, colisiones, caída, limpieza de líneas, snapshots de Game Over y transiciones. No importa Phaser ni EventBus. |
| `src/events/GameEvents.js` | Nombres centralizados de eventos.                                                                                                                              |
| `src/events/EventBus.js`   | Bus singleton respaldado por `Phaser.Events.EventEmitter`.                                                                                                     |
| `src/scenes/GameScene.js`  | Coordinador Phaser: estado, storage, audio, input, timers, render updates y emisión de eventos de dominio.                                                     |
| `src/scenes/components/`   | Colaboradores Phaser para render, UI, overlays, preview, score, indicadores de audio, entrada, audio y drop loop.                                              |
| `src/utils/`               | Storage, temporizadores, música retro y efectos de sonido.                                                                                                     |

Eventos actuales importantes:

- Eventos de ciclo de vida sin payload.
- `LINES_CLEARED` con `{ rows }`.
- `SCORE_UPDATED` con `{ stats }`.
- `LEVEL_UP` con `{ level }`.

## Estructura del proyecto

```text
tetris_clone/
├── src/
│   ├── classes/                 # Modelos puros: Block, Tetramino, Score
│   ├── config/                  # Constantes del juego
│   ├── events/                  # Contrato de eventos y EventBus
│   ├── logic/                   # Reglas y transiciones puras
│   ├── scenes/
│   │   ├── components/          # Colaboradores Phaser enfocados
│   │   └── GameScene.js         # Coordinador runtime Phaser
│   ├── utils/                   # Storage, audio y temporizadores
│   └── main.js                  # Entrada Vite
├── tests/                       # Jest + jsdom + mocks de Phaser
├── electron/main.cjs            # Entrada CommonJS de Electron
├── server.js                    # Servidor Express para producción web
├── vite.config.js               # Configuración de Vite
├── jest.config.js               # Configuración de Jest
├── eslint.config.js             # Configuración flat de ESLint
└── package.json
```

## Testing y calidad

- Jest corre en `jsdom` con `babel-jest`.
- Phaser se mockea desde `tests/__mocks__/phaser.js`.
- Los tests cubren dominio, estado de juego, máquina de estados, eventos, frontera Phaser y escena principal.
- ESLint usa configuración flat en `eslint.config.js`.
- Prettier está configurado con `.prettierrc.json` y `.prettierignore`.
- GitHub Actions ejecuta `npm ci`, `npm run lint`, `npm test` y `npm run build` en Node 20.

## Tecnologías

- **Phaser 3**: runtime de juego y renderizado.
- **Vite 5**: bundler y dev server.
- **Jest + jsdom**: pruebas unitarias y de escena con mocks.
- **Express**: servidor de producción web.
- **Electron**: aplicación de escritorio.
- **Web Audio API**: música retro y efectos de sonido.

## Licencia

MIT
