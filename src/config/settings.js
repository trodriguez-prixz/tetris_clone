export const GRID_COLS = 10;
export const GRID_ROWS = 20;
export const CELL_SIZE = 40;

export const SIDEBAR_WIDTH = 200;
export const PADDING = 20;

export const GAME_AREA_WIDTH = GRID_COLS * CELL_SIZE;
export const GAME_AREA_HEIGHT = GRID_ROWS * CELL_SIZE;
export const CANVAS_WIDTH = GAME_AREA_WIDTH + SIDEBAR_WIDTH + PADDING * 3;
export const CANVAS_HEIGHT = GAME_AREA_HEIGHT + PADDING * 2;

export const GAME_AREA_X = PADDING;
export const GAME_AREA_Y = PADDING;

export const SIDEBAR_X = GAME_AREA_WIDTH + PADDING * 2;
export const SIDEBAR_Y = PADDING;

export const PREVIEW_AREA_HEIGHT = 200;
export const SCORE_AREA_HEIGHT = 280;
export const PREVIEW_CELL_SIZE = CELL_SIZE / 2;
export const RENDERED_BLOCK_INSET = 2;
export const PANEL_BORDER_WIDTH = 2;

export const COLORS = {
  BACKGROUND: 0x34495e,
  PANEL_BACKGROUND: 0x2c3e50,
  PANEL_BORDER: 0xecf0f1,
  OVERLAY: 0x000000,
  GRID_LINE: 0x34495e,
  PRIMARY_TEXT: '#ecf0f1',
  SECONDARY_TEXT: '#95a5a6',
  MUTED_TEXT: '#7f8c8d',
  HEADER_TEXT: '#bdc3c7',
  DANGER: '#e74c3c',
  SUCCESS: '#2ecc71',
  WARNING: '#f39c12'
};

// Each tetramino is defined by relative positions from a pivot point (0, 0)
export const TETRAMINOS = {
  T: {
    blocks: [
      { x: -1, y: 0 },
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 }
    ],
    color: 0x9b59b6
  },
  L: {
    blocks: [
      { x: -1, y: 0 },
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 }
    ],
    color: 0xf39c12
  },
  J: {
    blocks: [
      { x: -1, y: 0 },
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: -1, y: 1 }
    ],
    color: 0x3498db
  },
  O: {
    blocks: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 }
    ],
    color: 0xf1c40f
  },
  I: {
    blocks: [
      { x: -1, y: 0 },
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 }
    ],
    color: 0x1abc9c
  },
  S: {
    blocks: [
      { x: -1, y: 1 },
      { x: 0, y: 1 },
      { x: 0, y: 0 },
      { x: 1, y: 0 }
    ],
    color: 0x2ecc71
  },
  Z: {
    blocks: [
      { x: -1, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 }
    ],
    color: 0xe74c3c
  }
};

export const SCORE_DATA = {
  1: 40,
  2: 100,
  3: 300,
  4: 1200
};

export const INITIAL_DROP_SPEED = 1000;

export const FAST_DROP_SPEED = 300;

export const LEVEL_SPEED_MULTIPLIER = 0.75;

export const LINES_PER_LEVEL = 10;

export const ELAPSED_TIME_UPDATE_INTERVAL = 1000;
export const HORIZONTAL_MOVE_DELAY = 200;
export const ROTATE_DELAY = 150;
export const START_INPUT_PAUSE_GUARD_DURATION = 200;
