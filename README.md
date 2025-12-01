# Tetris Clone

Un clon completo del juego Tetris implementado con JavaScript y Phaser 3.

## Características

- ✅ Implementación completa de la mecánica de Tetris
- ✅ 7 tipos de piezas (T, L, J, O, I, S, Z)
- ✅ Sistema de puntuación con niveles
- ✅ Vista previa de las próximas 3 piezas
- ✅ Aceleración de caída con tecla abajo
- ✅ Limpieza de filas completas
- ✅ Rotación de piezas
- ✅ Colisiones y física del juego
- ✅ Pantalla de inicio con instrucciones
- ✅ Sistema de Game Over
- ✅ Sistema de pausa (P o Espacio)
- ✅ Música retro de fondo (Korobeiniki - Tema de Tetris)
- ✅ Control de volumen de música (silenciar/activar)
- ✅ Efectos de sonido retro (movimiento, rotación, líneas eliminadas, game over)
- ✅ Control independiente de efectos de sonido

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

- **Flecha Izquierda (←)**: Mover pieza a la izquierda
- **Flecha Derecha (→)**: Mover pieza a la derecha
- **Flecha Arriba (↑)**: Rotar pieza
- **Flecha Abajo (↓)**: Acelerar caída (mueve la pieza inmediatamente y luego acelera)
- **P o Espacio**: Pausar/Reanudar juego
- **M**: Silenciar/activar música
- **S**: Silenciar/activar efectos de sonido
- **R**: Reiniciar juego (solo en Game Over)
- **Cualquier tecla o clic**: Comenzar juego (en pantalla de inicio)

## Características del Juego

### Sistema de Puntuación

- **Líneas eliminadas**: El jugador gana puntos al completar líneas
- **Niveles**: Cada 10 líneas completadas, el nivel aumenta
- **Velocidad**: La velocidad de caída aumenta con cada nivel
- **Puntos por línea**:
  - 1 línea: 40 puntos × nivel
  - 2 líneas: 100 puntos × nivel
  - 3 líneas: 300 puntos × nivel
  - 4 líneas: 1200 puntos × nivel

### Mecánica de Aceleración

- Al presionar la tecla abajo, la pieza se mueve inmediatamente una vez
- Mientras se mantiene presionada, la pieza cae más rápido (30% del tiempo normal)
- Al soltar la tecla, la velocidad vuelve a la normal

### Game Over

El juego termina cuando una nueva pieza no puede ser generada en la parte superior de la cuadrícula porque el espacio está ocupado por bloques previamente asentados.

### Música y Sonidos

- **Música retro de fondo**: Korobeiniki (Tema clásico de Tetris)
  - Volumen bajo para no interferir con el juego
  - Control de silencio con la tecla M
  - La música se inicia automáticamente cuando comienza el juego

- **Efectos de sonido retro**:
  - Sonido de movimiento al mover piezas
  - Sonido característico al rotar piezas
  - Sonidos diferentes según número de líneas eliminadas (1-4 líneas)
  - Sonido especial para Tetris (4 líneas)
  - Sonido de subida de nivel
  - Sonido de Game Over
  - Control independiente con la tecla S
  - Volumen ajustado para no interferir con la música

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
│   │   ├── timer.js            # Utilidades de temporizadores
│   │   ├── retroMusic.js       # Generador de música retro
│   │   └── soundEffects.js     # Generador de efectos de sonido
│   ├── main.js                 # Punto de entrada
│   └── index.html              # HTML base
├── tests/                      # Tests unitarios
│   ├── Block.test.js
│   ├── GameScene.test.js
│   ├── Score.test.js
│   └── Tetramino.test.js
├── electron/                   # Configuración de Electron
│   └── main.js
├── server.js                   # Servidor Express para despliegue
├── vite.config.js              # Configuración de Vite
├── jest.config.js              # Configuración de Jest
└── package.json
```

## Tecnologías

- **Phaser 3**: Framework de juegos
- **Vite**: Bundler y dev server
- **Jest**: Framework de testing
- **Electron**: Para aplicación de escritorio
- **Express**: Servidor para despliegue web
- **Web Audio API**: Para generación de música retro

## Arquitectura

### Clases Principales

- **Block**: Representa un bloque individual del juego
- **Tetramino**: Representa una pieza completa (4 bloques)
- **Score**: Gestiona la puntuación, niveles y líneas eliminadas
- **GameScene**: Escena principal que maneja toda la lógica del juego
- **RetroMusic**: Generador de música retro usando Web Audio API
- **SoundEffects**: Generador de efectos de sonido usando Web Audio API

### Flujo del Juego

1. **Inicio**: Se muestra pantalla de inicio con instrucciones
2. **Inicio del juego**: Usuario presiona cualquier tecla para comenzar
3. **Gameplay**: 
   - Se generan piezas aleatorias
   - El jugador controla la pieza actual
   - Las piezas caen automáticamente
   - Se eliminan líneas completas
   - Aumenta el nivel cada 10 líneas
4. **Game Over**: Cuando no se puede generar una nueva pieza
5. **Reinicio**: Presionar R para reiniciar

## Desarrollo

### Agregar Nuevas Funcionalidades

El código está organizado de manera modular:

- **Configuración**: Modifica `src/config/settings.js` para ajustar parámetros del juego
- **Nuevas piezas**: Agrega definiciones en `TETRAMINOS` en `settings.js`
- **Nueva música**: Modifica `src/utils/retroMusic.js` para agregar canciones
- **Nuevas características**: Extiende `GameScene.js` con nuevos métodos

### Testing

Los tests están organizados por clase y cubren las funcionalidades principales:

- `Block.test.js`: Pruebas de la clase Block
  - Instanciación correcta
  - Cálculo de posiciones pixel
  - Actualización de posiciones lógicas
  
- `Tetramino.test.js`: Pruebas de la clase Tetramino
  - Creación de piezas con 4 bloques
  - Movimiento (arriba, abajo, izquierda, derecha)
  - Rotación de piezas
  - Detección de colisiones
  
- `Score.test.js`: Pruebas del sistema de puntuación
  - Inicialización con valores cero
  - Cálculo de puntos con multiplicador de nivel
  - Incremento de nivel cada 10 líneas
  - Reset de puntuación
  
- `GameScene.test.js`: Pruebas de la escena principal
  - Dimensiones del canvas
  - Inicialización del campo de juego (20x10)
  - Estado de inicio del juego
  - Verificación de spawn de piezas

**Nota**: Las pruebas utilizan mocks de Phaser para funcionar en el entorno de Jest. El archivo `tests/__mocks__/phaser.js` proporciona implementaciones mock de las clases de Phaser necesarias.

## Licencia

MIT
