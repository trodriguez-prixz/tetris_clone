import EventBus from '../src/events/EventBus.js';
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
});
