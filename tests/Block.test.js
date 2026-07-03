import Block from '../src/classes/Block.js';

describe('Block', () => {
  let block;

  beforeEach(() => {
    block = new Block(5, 10, 0xff0000);
  });

  test('stores the initial logical position and color', () => {
    expect(block.x).toBe(5);
    expect(block.y).toBe(10);
    expect(block.color).toBe(0xff0000);
  });

  test('setLogicalPosition updates the logical position without changing color', () => {
    block.setLogicalPosition(3, 7);

    expect(block.x).toBe(3);
    expect(block.y).toBe(7);
    expect(block.color).toBe(0xff0000);
  });

  test('getLogicalPosition returns the current logical position', () => {
    expect(block.getLogicalPosition()).toEqual({ x: 5, y: 10 });

    block.setLogicalPosition(3, 7);

    expect(block.getLogicalPosition()).toEqual({ x: 3, y: 7 });
  });

  test('getLogicalPositionCopy returns an independent logical position value', () => {
    const pos = block.getLogicalPositionCopy();

    expect(pos).toEqual({ x: 5, y: 10 });

    pos.x = 1;
    pos.y = 2;

    expect(block.getLogicalPosition()).toEqual({ x: 5, y: 10 });
  });
});
