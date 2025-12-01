import GameScene from '../src/scenes/GameScene.js';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  GAME_AREA_WIDTH,
  GAME_AREA_HEIGHT,
  SIDEBAR_WIDTH,
  PADDING,
  GRID_ROWS,
  GRID_COLS
} from '../src/config/settings.js';

describe('GameScene - Phase 1 Tests', () => {
  let scene;
  let mockGame;

  beforeEach(() => {
    // Mock Phaser Game and Scene
    mockGame = {
      config: {
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT
      }
    };

    scene = new GameScene();
    scene.scene = { key: 'GameScene' };
    scene.game = mockGame;
  });

  test('Canvas dimensions match calculated values', () => {
    const expectedWidth = GAME_AREA_WIDTH + SIDEBAR_WIDTH + (PADDING * 3);
    const expectedHeight = GAME_AREA_HEIGHT + (PADDING * 2);

    expect(CANVAS_WIDTH).toBe(expectedWidth);
    expect(CANVAS_HEIGHT).toBe(expectedHeight);
  });

  test('GameScene is instantiated correctly', () => {
    expect(scene).toBeDefined();
    expect(scene.scene.key).toBe('GameScene');
  });

  test('Game area dimensions are correct', () => {
    expect(GAME_AREA_WIDTH).toBe(400); // 10 cols * 40px
    expect(GAME_AREA_HEIGHT).toBe(800); // 20 rows * 40px
  });
});

describe('GameScene - Phase 3 Tests', () => {
  let scene;
  let mockScene;

  beforeEach(() => {
    mockScene = {
      add: {
        rectangle: jest.fn(),
        text: jest.fn(() => ({
          setOrigin: jest.fn().mockReturnThis(),
          setFill: jest.fn().mockReturnThis(),
          setText: jest.fn().mockReturnThis()
        })),
        existing: jest.fn(),
        graphics: jest.fn(() => ({
          lineStyle: jest.fn().mockReturnThis(),
          strokeRect: jest.fn()
        }))
      },
      input: {
        keyboard: {
          createCursorKeys: jest.fn(() => ({
            left: { isDown: false, JustDown: false },
            right: { isDown: false, JustDown: false },
            up: { isDown: false, JustDown: false },
            down: { isDown: false, JustDown: false }
          })),
          addKey: jest.fn(() => ({
            on: jest.fn()
          })),
          on: jest.fn(),
          off: jest.fn()
        },
        on: jest.fn(),
        off: jest.fn()
      },
      time: {
        addEvent: jest.fn(() => ({
          remove: jest.fn(),
          getProgress: jest.fn(() => 0)
        })),
        delayedCall: jest.fn(),
        now: 0
      },
      tweens: {
        add: jest.fn()
      }
    };

    scene = new GameScene();
    scene.add = mockScene.add;
    scene.input = mockScene.input;
    scene.time = mockScene.time;
    scene.tweens = mockScene.tweens;
  });

  test('field_data is initialized as 20x10 grid with null values', () => {
    scene.create();
    
    expect(scene.fieldData).toBeDefined();
    expect(scene.fieldData.length).toBe(GRID_ROWS);
    scene.fieldData.forEach(row => {
      expect(row.length).toBe(GRID_COLS);
      row.forEach(cell => {
        expect(cell).toBeNull();
      });
    });
  });

  test('gameStarted is false initially', () => {
    scene.create();
    expect(scene.gameStarted).toBe(false);
  });

  test('startGame sets gameStarted to true', () => {
    scene.create();
    // Mock startScreenUI to avoid destroy errors
    scene.startScreenUI = {
      overlay: { destroy: jest.fn() },
      titleText: { destroy: jest.fn() },
      instructionsTitle: { destroy: jest.fn() },
      instructionTexts: [{ destroy: jest.fn() }],
      startText: { destroy: jest.fn() }
    };
    // Mock previewBlocks to avoid errors
    scene.previewBlocks = [];
    // Mock spawnTetramino to avoid actual spawning
    const originalSpawn = scene.spawnTetramino;
    scene.spawnTetramino = jest.fn();
    scene.startGame();
    expect(scene.gameStarted).toBe(true);
    scene.spawnTetramino = originalSpawn;
  });

  test('canSpawnTetramino returns true for empty field', () => {
    scene.create();
    const canSpawn = scene.canSpawnTetramino('T');
    expect(canSpawn).toBe(true);
  });

  test('canSpawnTetramino returns false when spawn area is blocked', () => {
    scene.create();
    // Block the spawn area
    scene.fieldData[0][4] = { destroy: jest.fn() };
    scene.fieldData[0][5] = { destroy: jest.fn() };
    
    const canSpawn = scene.canSpawnTetramino('T');
    expect(canSpawn).toBe(false);
  });
});

