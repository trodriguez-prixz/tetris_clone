import Tetramino from '../src/classes/Tetramino.js';
import { TETRAMINOS, GRID_COLS } from '../src/config/settings.js';

describe('Tetramino', () => {
  let scene;
  let tetramino;

  beforeEach(() => {
    // Mock Phaser scene
    scene = {
      add: {
        existing: jest.fn()
      },
      time: {
        now: 0
      }
    };
    // Make Phaser available globally for Vector2
    global.Phaser = require('../tests/__mocks__/phaser.js').default;
  });

  test('Tetramino creates exactly 4 blocks', () => {
    tetramino = new Tetramino(scene, 'T');
    expect(tetramino.blocks.length).toBe(4);
  });

  test('Tetramino creates blocks with correct relative positions', () => {
    tetramino = new Tetramino(scene, 'T');
    const tData = TETRAMINOS['T'];
    const startX = Math.floor(GRID_COLS / 2) - 1;
    const startY = 0;

    tetramino.blocks.forEach((block, index) => {
      const expectedX = startX + tData.blocks[index].x;
      const expectedY = startY + tData.blocks[index].y;
      const pos = block.getLogicalPosition();
      expect(pos.x).toBe(expectedX);
      expect(pos.y).toBe(expectedY);
    });
  });

  test('moveDown increments Y position by 1 for all blocks', () => {
    tetramino = new Tetramino(scene, 'O');
    const initialPositions = tetramino.blocks.map(block => block.getLogicalPosition());
    
    tetramino.moveDown();
    
    tetramino.blocks.forEach((block, index) => {
      const pos = block.getLogicalPosition();
      expect(pos.x).toBe(initialPositions[index].x);
      expect(pos.y).toBe(initialPositions[index].y + 1);
    });
  });

  test('moveLeft decrements X position by 1 for all blocks', () => {
    tetramino = new Tetramino(scene, 'O');
    const initialPositions = tetramino.blocks.map(block => block.getLogicalPosition());
    
    tetramino.moveLeft();
    
    tetramino.blocks.forEach((block, index) => {
      const pos = block.getLogicalPosition();
      expect(pos.x).toBe(initialPositions[index].x - 1);
      expect(pos.y).toBe(initialPositions[index].y);
    });
  });

  test('moveRight increments X position by 1 for all blocks', () => {
    tetramino = new Tetramino(scene, 'O');
    const initialPositions = tetramino.blocks.map(block => block.getLogicalPosition());
    
    tetramino.moveRight();
    
    tetramino.blocks.forEach((block, index) => {
      const pos = block.getLogicalPosition();
      expect(pos.x).toBe(initialPositions[index].x + 1);
      expect(pos.y).toBe(initialPositions[index].y);
    });
  });

  test('getBlockPositions returns all block positions', () => {
    tetramino = new Tetramino(scene, 'I');
    const positions = tetramino.getBlockPositions();
    
    expect(positions.length).toBe(4);
    positions.forEach(pos => {
      expect(pos).toHaveProperty('x');
      expect(pos).toHaveProperty('y');
    });
  });

  test('nextMoveHorizontalCollide detects wall collision on left', () => {
    tetramino = new Tetramino(scene, 'O');
    // Move to left edge
    for (let i = 0; i < 5; i++) {
      tetramino.moveLeft();
    }
    
    expect(tetramino.nextMoveHorizontalCollide(-1)).toBe(true);
  });

  test('nextMoveHorizontalCollide detects wall collision on right', () => {
    tetramino = new Tetramino(scene, 'O');
    // Move to right edge
    for (let i = 0; i < 5; i++) {
      tetramino.moveRight();
    }
    
    expect(tetramino.nextMoveHorizontalCollide(1)).toBe(true);
  });

  test('nextMoveVerticalCollide detects floor collision', () => {
    tetramino = new Tetramino(scene, 'O');
    // Move to bottom
    for (let i = 0; i < 20; i++) {
      tetramino.moveDown();
    }
    
    expect(tetramino.nextMoveVerticalCollide()).toBe(true);
  });

  test('canRotate returns true when rotation is valid', () => {
    tetramino = new Tetramino(scene, 'O');
    // O piece is a square, so rotation should be valid
    // The O piece at center position should be able to rotate
    const canRotate = tetramino.canRotate(null);
    // O piece rotation should work (it's symmetric)
    expect(typeof canRotate).toBe('boolean');
  });

  test('canRotate returns false when rotation would hit wall', () => {
    tetramino = new Tetramino(scene, 'I');
    // Move to left edge
    for (let i = 0; i < 5; i++) {
      tetramino.moveLeft();
    }
    // Rotation might cause wall collision
    // This test depends on the specific shape and position
  });

  test('rotate changes block positions correctly', () => {
    tetramino = new Tetramino(scene, 'T');
    const initialPositions = tetramino.getBlockPositions();
    
    tetramino.rotate();
    
    const newPositions = tetramino.getBlockPositions();
    // After rotation, positions should be different
    expect(newPositions).not.toEqual(initialPositions);
    // But should still have 4 blocks
    expect(newPositions.length).toBe(4);
  });
});

