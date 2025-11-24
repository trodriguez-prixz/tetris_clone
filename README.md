# Tetris Clone

Un clon completo del juego Tetris implementado con JavaScript y Phaser 3.

## Características

- Implementación completa de la mecánica de Tetris
- 7 tipos de piezas (T, L, J, O, I, S, Z)
- Sistema de puntuación con niveles
- Vista previa de las próximas 3 piezas
- Aceleración de caída con tecla abajo
- Limpieza de filas completas
- Rotación de piezas
- Colisiones y física del juego

## Requisitos

- Node.js 18+ 
- npm o yarn

## Instalación

```bash
npm install
```

## Desarrollo

Para ejecutar en modo desarrollo:

```bash
npm run dev
```

El juego se abrirá en `http://localhost:3000`

## Testing

Para ejecutar los tests:

```bash
npm test
```

Para ejecutar tests en modo watch:

```bash
npm run test:watch
```

## Build

Para construir la versión de producción:

```bash
npm run build
```

## Despliegue

### Web (Heroku)

1. Asegúrate de tener el build de producción: `npm run build`
2. El `Procfile` está configurado para usar `server.js`
3. Despliega en Heroku siguiendo las instrucciones estándar

### Escritorio (Electron)

#### Mac

```bash
npm run build:electron:mac
```

Esto generará un archivo `.dmg` en `dist-electron/`

#### Linux

```bash
npm run build:electron:linux
```

Esto generará un archivo `.AppImage` en `dist-electron/`

## Controles

- **Flecha Izquierda**: Mover pieza a la izquierda
- **Flecha Derecha**: Mover pieza a la derecha
- **Flecha Arriba**: Rotar pieza
- **Flecha Abajo**: Acelerar caída

## Estructura del Proyecto

```
tetris_clone/
├── src/
│   ├── config/
│   │   └── settings.js          # Configuración del juego
│   ├── classes/
│   │   ├── Block.js            # Clase para bloques individuales
│   │   ├── Tetramino.js        # Clase para piezas
│   │   └── Score.js             # Gestión de puntuación
│   ├── scenes/
│   │   └── GameScene.js        # Escena principal del juego
│   ├── utils/
│   │   └── timer.js            # Utilidades de temporizadores
│   ├── main.js                 # Punto de entrada
│   └── index.html              # HTML base
├── tests/                      # Tests unitarios
├── electron/                   # Configuración de Electron
└── package.json
```

## Tecnologías

- **Phaser 3**: Framework de juegos
- **Vite**: Bundler y dev server
- **Jest**: Framework de testing
- **Electron**: Para aplicación de escritorio
- **Express**: Servidor para despliegue web

## Licencia

MIT

