import Tetramino from '../src/classes/Tetramino.js';
import { TETRAMINOS, GRID_COLS, GRID_ROWS } from '../src/config/settings.js';

const clonePositions = (tetramino) =>
  tetramino.getBlockPositions().map((pos) => ({ ...pos }));

const emptyField = () =>
  Array.from({ length: GRID_ROWS }, () =>
    Array.from({ length: GRID_COLS }, () => null)
  );

describe('Tetramino', () => {
  test('creates four blocks for a requested type at the centered spawn position', () => {
    const tetramino = new Tetramino('T');
    const startX = Math.floor(GRID_COLS / 2) - 1;

    expect(tetramino.type).toBe('T');
    expect(tetramino.color).toBe(TETRAMINOS.T.color);
    expect(clonePositions(tetramino)).toEqual(
      TETRAMINOS.T.blocks.map((pos) => ({
        x: startX + pos.x,
        y: pos.y
      }))
    );
  });

  test('moves every block and pivot by one cell in the requested direction', () => {
    const tetramino = new Tetramino('O');
    const initialPivot = { ...tetramino.pivot };

    tetramino.moveDown();
    tetramino.moveLeft();
    tetramino.moveRight();

    expect(clonePositions(tetramino)).toEqual([
      { x: 4, y: 1 },
      { x: 5, y: 1 },
      { x: 4, y: 2 },
      { x: 5, y: 2 }
    ]);
    expect(tetramino.pivot).toEqual({
      x: initialPivot.x,
      y: initialPivot.y + 1
    });
  });

  test('detects horizontal wall and settled-block collisions before moving', () => {
    const tetramino = new Tetramino('O');
    const fieldData = emptyField();

    expect(tetramino.nextMoveHorizontalCollide(-1, fieldData)).toBe(false);
    expect(tetramino.nextMoveHorizontalCollide(1, fieldData)).toBe(false);

    fieldData[0][3] = { occupied: true };
    expect(tetramino.nextMoveHorizontalCollide(-1, fieldData)).toBe(true);

    while (!tetramino.nextMoveHorizontalCollide(-1)) {
      tetramino.moveLeft();
    }

    expect(tetramino.nextMoveHorizontalCollide(-1)).toBe(true);
  });

  test('detects vertical floor and settled-block collisions before moving down', () => {
    const tetramino = new Tetramino('O');
    const fieldData = emptyField();

    expect(tetramino.nextMoveVerticalCollide(fieldData)).toBe(false);

    fieldData[2][4] = { occupied: true };
    expect(tetramino.nextMoveVerticalCollide(fieldData)).toBe(true);

    const fallingTetramino = new Tetramino('O');
    while (!fallingTetramino.nextMoveVerticalCollide()) {
      fallingTetramino.moveDown();
    }

    expect(
      fallingTetramino
        .getBlockPositions()
        .some((pos) => pos.y === GRID_ROWS - 1)
    ).toBe(true);
    expect(fallingTetramino.nextMoveVerticalCollide()).toBe(true);
  });

  test('rotates clockwise around the pivot and advances rotation state', () => {
    const tetramino = new Tetramino('T');
    tetramino.moveDown();

    tetramino.rotate();

    expect(clonePositions(tetramino)).toEqual([
      { x: 4, y: 2 },
      { x: 4, y: 1 },
      { x: 4, y: 0 },
      { x: 5, y: 1 }
    ]);
    expect(tetramino.rotation).toBe(90);

    tetramino.rotateWithOffset(1, 0);
    expect(tetramino.pivot).toEqual({ x: 5, y: 1 });
    expect(tetramino.rotation).toBe(180);
    expect(clonePositions(tetramino)).toEqual([
      { x: 6, y: 1 },
      { x: 5, y: 1 },
      { x: 4, y: 1 },
      { x: 5, y: 0 }
    ]);
  });

  test('checks rotated positions against boundaries and occupied cells without mutating the piece', () => {
    const tetramino = new Tetramino('T');
    tetramino.moveDown();
    const fieldData = emptyField();
    const originalPositions = clonePositions(tetramino);
    const originalPivot = { ...tetramino.pivot };

    expect(tetramino.canRotate(fieldData)).toBe(true);

    fieldData[0][4] = { occupied: true };
    expect(tetramino.canRotate(fieldData)).toBe(false);
    expect(clonePositions(tetramino)).toEqual(originalPositions);
    expect(tetramino.pivot).toEqual(originalPivot);
    expect(tetramino.rotation).toBe(0);
  });

  test('returns the first valid wall-kick offset without applying it', () => {
    const tetramino = new Tetramino('T');
    tetramino.moveDown();
    const fieldData = emptyField();
    fieldData[0][4] = { occupied: true };

    expect(tetramino.tryRotateWithWallKick(fieldData)).toEqual({ x: -1, y: 0 });
    expect(tetramino.rotation).toBe(0);
    expect(tetramino.pivot).toEqual({ x: 4, y: 1 });
  });
});
