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
          }))
        }
      },
      time: {
        addEvent: jest.fn(() => ({
          remove: jest.fn(),
          getProgress: jest.fn(() => 0)
        })),
        now: 0
      }
    };

    scene = new GameScene();
    scene.add = mockScene.add;
    scene.input = mockScene.input;
    scene.time = mockScene.time;
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

  test('landTetramino stores blocks in field_data', () => {
    scene.create();
    
    // Manually set tetramino position to bottom
    if (scene.currentTetramino) {
      // Move tetramino to bottom
      for (let i = 0; i < GRID_ROWS; i++) {
        scene.currentTetramino.moveDown();
      }
      
      // Get positions before landing
      const positions = scene.currentTetramino.getBlockPositions();
      
      // Land the tetramino
      scene.landTetramino();
      
      // Verify blocks are stored in field_data
      positions.forEach(pos => {
        if (pos.y >= 0 && pos.y < GRID_ROWS && pos.x >= 0 && pos.x < GRID_COLS) {
          expect(scene.fieldData[pos.y][pos.x]).not.toBeNull();
        }
      });
      
      // Verify new tetramino is spawned
      expect(scene.currentTetramino).not.toBeNull();
    }
  });
});

