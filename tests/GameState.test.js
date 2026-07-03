import GameState from '../src/logic/GameState.js';
import EventBus, { EVENTS } from '../src/events/EventBus.js';
import Block from '../src/classes/Block.js';
import { GRID_COLS, GRID_ROWS, INITIAL_DROP_SPEED, FAST_DROP_SPEED, LEVEL_SPEED_MULTIPLIER } from '../src/config/settings.js';

const createFilledRow = (row, color = 0xffffff) => (
  Array.from({ length: GRID_COLS }, (_, col) => new Block(col, row, color))
);

describe('GameState', () => {
  let gameState;

  beforeEach(() => {
    jest.spyOn(Math, 'random').mockReturnValue(0);
    EventBus.removeAllListeners();
    gameState = new GameState();
  });

  afterEach(() => {
    EventBus.removeAllListeners();
    jest.restoreAllMocks();
  });

  test('initializes an empty board with default timing, score, and preview queue', () => {
    expect(gameState.fieldData).toHaveLength(GRID_ROWS);
    expect(gameState.fieldData.every(row => row.length === GRID_COLS)).toBe(true);
    expect(gameState.fieldData.flat().every(cell => cell === null)).toBe(true);
    expect(gameState.currentTetramino).toBeNull();
    expect(gameState.dropSpeed).toBe(INITIAL_DROP_SPEED);
    expect(gameState.baseDropSpeed).toBe(INITIAL_DROP_SPEED);
    expect(gameState.softDropActive).toBe(false);
    expect(gameState.score.getAllStats()).toEqual(expect.objectContaining({ score: 0, level: 1, lines: 0, pieces: 0 }));
    expect(gameState.nextShapes).toEqual(['T', 'T', 'T']);
  });

  test('reset restores board, score, timing, active piece, and preview queue', () => {
    gameState.fieldData[GRID_ROWS - 1] = createFilledRow(GRID_ROWS - 1);
    gameState.score.addScore(4);
    gameState.score.incrementPiecesPlaced();
    gameState.dropSpeed = 250;
    gameState.baseDropSpeed = 250;
    gameState.softDropActive = true;
    gameState.currentTetramino = { type: 'O' };
    gameState.nextShapes = ['I'];

    gameState.reset();

    expect(gameState.fieldData.flat().every(cell => cell === null)).toBe(true);
    expect(gameState.currentTetramino).toBeNull();
    expect(gameState.score.getAllStats()).toEqual(expect.objectContaining({ score: 0, level: 1, lines: 0, pieces: 0 }));
    expect(gameState.dropSpeed).toBe(INITIAL_DROP_SPEED);
    expect(gameState.baseDropSpeed).toBe(INITIAL_DROP_SPEED);
    expect(gameState.softDropActive).toBe(false);
    expect(gameState.nextShapes).toEqual(['T', 'T', 'T']);
  });

  test('startSoftDrop and stopSoftDrop own soft-drop speed selection', () => {
    gameState.baseDropSpeed = 700;
    gameState.dropSpeed = 700;

    expect(gameState.startSoftDrop()).toBe(true);
    expect(gameState.dropSpeed).toBe(FAST_DROP_SPEED);
    expect(gameState.softDropActive).toBe(true);
    expect(gameState.startSoftDrop()).toBe(false);

    expect(gameState.stopSoftDrop()).toBe(true);
    expect(gameState.dropSpeed).toBe(700);
    expect(gameState.softDropActive).toBe(false);
    expect(gameState.stopSoftDrop()).toBe(false);
  });

  test('spawnTetramino consumes the next shape, replenishes the queue, and emits a preview update', () => {
    const previewUpdates = jest.fn();
    EventBus.on(EVENTS.NEXT_SHAPE_UPDATED, previewUpdates);
    gameState.nextShapes = ['O', 'I', 'T'];
    Math.random.mockReturnValueOnce(5 / 7);

    const spawned = gameState.spawnTetramino();

    expect(spawned).toBe(true);
    expect(gameState.currentTetramino.type).toBe('O');
    expect(gameState.nextShapes).toEqual(['I', 'T', 'S']);
    expect(previewUpdates).toHaveBeenCalledTimes(1);
  });

  test('spawnTetramino returns false and preserves the current state when the spawn area is blocked', () => {
    const previewUpdates = jest.fn();
    EventBus.on(EVENTS.NEXT_SHAPE_UPDATED, previewUpdates);
    gameState.nextShapes = ['O', 'I', 'T'];
    gameState.fieldData[1][4] = new Block(4, 1, 0xffffff);

    const spawned = gameState.spawnTetramino();

    expect(spawned).toBe(false);
    expect(gameState.currentTetramino).toBeNull();
    expect(gameState.nextShapes).toEqual(['I', 'T']);
    expect(previewUpdates).not.toHaveBeenCalled();
  });

  test('updateTick returns a moved result while moving the active piece down', () => {
    gameState.nextShapes = ['O', 'I', 'T'];
    gameState.spawnTetramino();
    const initialPositions = gameState.currentTetramino.getBlockPositions().map(pos => ({ ...pos }));

    const result = gameState.updateTick();

    expect(result).toEqual({ moved: true, locked: false, spawned: false, gameOver: false });
    expect(gameState.currentTetramino.getBlockPositions()).toEqual(
      initialPositions.map(pos => ({ x: pos.x, y: pos.y + 1 }))
    );
  });

  test('updateTick returns a lock result while locking and spawning the next piece', () => {
    const locked = jest.fn();
    EventBus.on(EVENTS.TETRAMINO_LOCKED, locked);
    gameState.nextShapes = ['O', 'I', 'T'];
    gameState.spawnTetramino();
    for (let i = 0; i < GRID_ROWS - 2; i++) {
      gameState.currentTetramino.moveDown();
    }

    const result = gameState.updateTick();

    expect(result).toEqual({ moved: false, locked: true, spawned: true, gameOver: false });
    expect(locked).toHaveBeenCalledTimes(1);
    expect(gameState.score.getAllStats().pieces).toBe(1);
    expect(gameState.currentTetramino.type).toBe('I');
    expect(gameState.fieldData[GRID_ROWS - 2][4]).not.toBeNull();
    expect(gameState.fieldData[GRID_ROWS - 1][5]).not.toBeNull();
  });

  test('updateTick returns a game-over result when locking cannot spawn a new piece', () => {
    const gameOver = jest.fn();
    EventBus.on(EVENTS.GAME_OVER, gameOver);
    gameState.nextShapes = ['O', 'O', 'T'];
    gameState.spawnTetramino();
    for (let i = 0; i < GRID_ROWS - 2; i++) {
      gameState.currentTetramino.moveDown();
    }
    gameState.fieldData[1][4] = new Block(4, 1, 0xffffff);

    const result = gameState.updateTick();

    expect(result).toEqual({ moved: false, locked: true, spawned: false, gameOver: true });
    expect(gameOver).toHaveBeenCalledTimes(1);
    expect(gameState.currentTetramino).toBeNull();
  });

  test('checkFinishedRows clears completed rows, applies gravity, scores, and emits events', () => {
    const linesCleared = jest.fn();
    const scoreUpdated = jest.fn();
    EventBus.on(EVENTS.LINES_CLEARED, linesCleared);
    EventBus.on(EVENTS.SCORE_UPDATED, scoreUpdated);
    const fallingBlock = new Block(3, GRID_ROWS - 2, 0xff0000);
    gameState.fieldData[GRID_ROWS - 2][3] = fallingBlock;
    gameState.fieldData[GRID_ROWS - 1] = createFilledRow(GRID_ROWS - 1);

    gameState.checkFinishedRows();

    expect(linesCleared).toHaveBeenCalledWith([GRID_ROWS - 1]);
    expect(gameState.fieldData[GRID_ROWS - 2][3]).toBeNull();
    expect(gameState.fieldData[GRID_ROWS - 1][3]).toBe(fallingBlock);
    expect(fallingBlock.getLogicalPosition()).toEqual({ x: 3, y: GRID_ROWS - 1 });
    expect(gameState.score.getAllStats()).toEqual(expect.objectContaining({ score: 40, level: 1, lines: 1, pieces: 0 }));
    expect(scoreUpdated).toHaveBeenCalledWith(expect.objectContaining({ score: 40, level: 1, lines: 1, pieces: 0 }));
  });

  test('clearing enough lines updates level and drop speed', () => {
    const levelUp = jest.fn();
    EventBus.on(EVENTS.LEVEL_UP, levelUp);

    for (let i = 0; i < 9; i++) {
      gameState.score.addScore(1);
    }
    gameState.fieldData[GRID_ROWS - 1] = createFilledRow(GRID_ROWS - 1);

    gameState.checkFinishedRows();

    expect(gameState.score.getLevel()).toBe(2);
    expect(gameState.baseDropSpeed).toBe(INITIAL_DROP_SPEED * LEVEL_SPEED_MULTIPLIER);
    expect(gameState.dropSpeed).toBe(gameState.baseDropSpeed);
    expect(levelUp).toHaveBeenCalledWith(2);
  });
});
