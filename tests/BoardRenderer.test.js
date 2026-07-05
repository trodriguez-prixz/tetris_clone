import EventBus, { EVENTS } from '../src/events/EventBus.js';
import BoardRenderer from '../src/scenes/components/BoardRenderer.js';
import {
  CELL_SIZE,
  GAME_AREA_X,
  GAME_AREA_Y,
  GRID_COLS,
  GRID_ROWS,
  VISUAL_SYSTEM
} from '../src/config/settings.js';

const BLOCK_COLOR = 0x9b59b6;

const createDisplayObject = () => ({
  x: 0,
  y: 0,
  setOrigin: jest.fn().mockReturnThis(),
  setAlpha: jest.fn().mockReturnThis(),
  setStrokeStyle: jest.fn().mockReturnThis(),
  destroy: jest.fn()
});

const createGraphicsObject = () => ({
  lineStyle: jest.fn().mockReturnThis(),
  strokeRect: jest.fn().mockReturnThis(),
  moveTo: jest.fn().mockReturnThis(),
  lineTo: jest.fn().mockReturnThis(),
  strokePath: jest.fn().mockReturnThis()
});

const buildScene = () => ({
  add: {
    rectangle: jest.fn(() => createDisplayObject()),
    graphics: jest.fn(() => createGraphicsObject())
  },
  tweens: {
    add: jest.fn()
  }
});

const createEmptyField = () =>
  Array(GRID_ROWS)
    .fill(null)
    .map(() => Array(GRID_COLS).fill(null));

const logicalCenter = (logicalY) =>
  GAME_AREA_Y + logicalY * CELL_SIZE + CELL_SIZE / 2;

describe('BoardRenderer gameplay readability', () => {
  afterEach(() => {
    EventBus.removeAllListeners();
  });

  test('draws a landing-position ghost before the focused active piece', () => {
    const scene = buildScene();
    const gameState = {
      fieldData: createEmptyField(),
      currentTetramino: {
        blocks: [
          { x: 4, y: 0, color: BLOCK_COLOR },
          { x: 5, y: 0, color: BLOCK_COLOR },
          { x: 4, y: 1, color: BLOCK_COLOR },
          { x: 5, y: 1, color: BLOCK_COLOR }
        ]
      }
    };
    const renderer = new BoardRenderer(scene, gameState);
    scene.add.rectangle.mockClear();

    renderer.update();

    const rectangles = scene.add.rectangle.mock.results.map(
      ({ value }) => value
    );
    expect(rectangles).toHaveLength(8);
    expect(scene.add.rectangle.mock.calls[0][1]).toBe(
      logicalCenter(GRID_ROWS - 2)
    );
    expect(scene.add.rectangle.mock.calls[4][1]).toBe(logicalCenter(0));
    expect(rectangles[0].setAlpha).toHaveBeenCalledWith(0.22);
    expect(rectangles[0].setStrokeStyle).toHaveBeenCalledWith(
      VISUAL_SYSTEM.borders.normal,
      VISUAL_SYSTEM.palette.border.focus,
      0.85
    );
    expect(rectangles[4].setAlpha).toHaveBeenCalledWith(1);
    expect(rectangles[4].setStrokeStyle).toHaveBeenCalledWith(
      VISUAL_SYSTEM.borders.normal,
      VISUAL_SYSTEM.palette.border.focus,
      1
    );
  });

  test('calculates the ghost from field data without moving the active piece', () => {
    const scene = buildScene();
    const lockedBlock = { x: 4, y: 5, color: 0x3498db };
    const fieldData = createEmptyField();
    fieldData[5][4] = lockedBlock;
    const activeBlock = { x: 4, y: 0, color: BLOCK_COLOR };
    const gameState = {
      fieldData,
      currentTetramino: {
        blocks: [activeBlock]
      }
    };
    const renderer = new BoardRenderer(scene, gameState);
    scene.add.rectangle.mockClear();

    renderer.update();

    expect(scene.add.rectangle.mock.calls[0][0]).toBe(
      GAME_AREA_X + 4 * CELL_SIZE + CELL_SIZE / 2
    );
    expect(scene.add.rectangle.mock.calls[0][1]).toBe(logicalCenter(4));
    expect(activeBlock.y).toBe(0);
  });

  test('keeps locked blocks visually quieter than the active piece', () => {
    const scene = buildScene();
    const fieldData = createEmptyField();
    fieldData[18][4] = { x: 4, y: 18, color: 0x3498db };
    const gameState = {
      fieldData,
      currentTetramino: {
        blocks: [{ x: 5, y: GRID_ROWS - 1, color: BLOCK_COLOR }]
      }
    };
    const renderer = new BoardRenderer(scene, gameState);
    scene.add.rectangle.mockClear();

    renderer.update();

    const rectangles = scene.add.rectangle.mock.results.map(
      ({ value }) => value
    );
    expect(rectangles).toHaveLength(2);
    expect(rectangles[0].setStrokeStyle).toHaveBeenCalledWith(
      VISUAL_SYSTEM.borders.normal,
      VISUAL_SYSTEM.palette.border.focus,
      1
    );
    expect(rectangles[1].setStrokeStyle).toHaveBeenCalledWith(
      VISUAL_SYSTEM.borders.thin,
      VISUAL_SYSTEM.palette.border.secondary,
      VISUAL_SYSTEM.borders.alpha.blockStroke
    );
  });

  test('keeps line-clear particles bounded and short-lived', () => {
    const scene = buildScene();
    const gameState = {
      fieldData: createEmptyField(),
      currentTetramino: null
    };
    new BoardRenderer(scene, gameState);
    scene.add.rectangle.mockClear();

    EventBus.emit(EVENTS.LINES_CLEARED, { rows: [16, 17, 18, 19] });

    expect(scene.add.rectangle.mock.calls.length).toBeGreaterThan(0);
    expect(scene.add.rectangle.mock.calls.length).toBeLessThanOrEqual(
      GRID_COLS * 4 * 3
    );
    expect(scene.tweens.add).toHaveBeenCalledTimes(
      scene.add.rectangle.mock.calls.length
    );
    scene.tweens.add.mock.calls.forEach(([config]) => {
      expect(config.duration).toBeLessThanOrEqual(440);
      expect(config.alpha.from).toBeGreaterThan(0);
      expect(config.alpha.to).toBe(0);
      expect(config.scale.from).toBeGreaterThan(0);
      expect(config.scale.from).toBeLessThanOrEqual(1);
      expect(config.scale.to).toBe(0);
      expect(config.onComplete).toEqual(expect.any(Function));
      config.onComplete();
      expect(config.targets.destroy).toHaveBeenCalledTimes(1);
    });
  });

  test('fades and shrinks removed locked blocks before destroying them', () => {
    const scene = buildScene();
    const lockedBlock = { x: 4, y: 18, color: 0x3498db };
    const fieldData = createEmptyField();
    fieldData[18][4] = lockedBlock;
    const gameState = {
      fieldData,
      currentTetramino: null
    };
    const renderer = new BoardRenderer(scene, gameState);
    scene.add.rectangle.mockClear();

    renderer.update();
    const lockedVisual = scene.add.rectangle.mock.results[0].value;
    scene.tweens.add.mockClear();
    fieldData[18][4] = null;

    renderer.update();

    expect(scene.tweens.add).toHaveBeenCalledWith(
      expect.objectContaining({
        targets: lockedVisual,
        scaleX: expect.any(Number),
        scaleY: expect.any(Number),
        alpha: 0,
        duration: expect.any(Number),
        onComplete: expect.any(Function)
      })
    );
    const [fadeConfig] = scene.tweens.add.mock.calls[0];
    expect(fadeConfig.scaleX).toBeGreaterThan(0);
    expect(fadeConfig.scaleX).toBeLessThan(1);
    expect(fadeConfig.scaleY).toBe(fadeConfig.scaleX);
    expect(fadeConfig.duration).toBeGreaterThan(0);
    expect(fadeConfig.duration).toBeLessThanOrEqual(200);

    fadeConfig.onComplete();

    expect(lockedVisual.destroy).toHaveBeenCalledTimes(1);
  });
});
