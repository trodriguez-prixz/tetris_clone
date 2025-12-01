import Block from '../src/classes/Block.js';
import { CELL_SIZE, GAME_AREA_X, GAME_AREA_Y } from '../src/config/settings.js';

describe('Block', () => {
  let scene;
  let block;

  beforeEach(() => {
    // Mock Phaser scene
    scene = {
      add: {
        existing: jest.fn()
      }
    };
    
    block = new Block(scene, 5, 10, 0xff0000);
  });

  test('Block is instantiated with correct logical position', () => {
    expect(block.logicalPos.x).toBe(5);
    expect(block.logicalPos.y).toBe(10);
  });

  test('Block calculates pixel position correctly', () => {
    const expectedX = GAME_AREA_X + (5 * CELL_SIZE) + (CELL_SIZE / 2);
    const expectedY = GAME_AREA_Y + (10 * CELL_SIZE) + (CELL_SIZE / 2);
    
    expect(block.x).toBe(expectedX);
    expect(block.y).toBe(expectedY);
  });

  test('setLogicalPosition updates both logical and pixel positions', () => {
    block.setLogicalPosition(3, 7);
    
    expect(block.logicalPos.x).toBe(3);
    expect(block.logicalPos.y).toBe(7);
    
    const expectedX = GAME_AREA_X + (3 * CELL_SIZE) + (CELL_SIZE / 2);
    const expectedY = GAME_AREA_Y + (7 * CELL_SIZE) + (CELL_SIZE / 2);
    
    expect(block.x).toBe(expectedX);
    expect(block.y).toBe(expectedY);
  });

  test('getLogicalPosition returns logical position reference', () => {
    const pos = block.getLogicalPosition();
    expect(pos.x).toBe(5);
    expect(pos.y).toBe(10);
    expect(pos).toBe(block.logicalPos); // Returns reference for performance
  });

  test('getLogicalPositionCopy returns a clone of logical position', () => {
    const pos = block.getLogicalPositionCopy();
    expect(pos.x).toBe(5);
    expect(pos.y).toBe(10);
    expect(pos).not.toBe(block.logicalPos); // Should be a clone
  });
});

