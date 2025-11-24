// Game dimensions
export const GRID_COLS = 10;
export const GRID_ROWS = 20;
export const CELL_SIZE = 40;

// Sidebar and padding
export const SIDEBAR_WIDTH = 200;
export const PADDING = 20;

// Calculate canvas dimensions
export const GAME_AREA_WIDTH = GRID_COLS * CELL_SIZE;
export const GAME_AREA_HEIGHT = GRID_ROWS * CELL_SIZE;
export const CANVAS_WIDTH = GAME_AREA_WIDTH + SIDEBAR_WIDTH + (PADDING * 3);
export const CANVAS_HEIGHT = GAME_AREA_HEIGHT + (PADDING * 2);

// Game area position
export const GAME_AREA_X = PADDING;
export const GAME_AREA_Y = PADDING;

// Sidebar position
export const SIDEBAR_X = GAME_AREA_WIDTH + (PADDING * 2);
export const SIDEBAR_Y = PADDING;

// Preview area dimensions (within sidebar)
export const PREVIEW_AREA_HEIGHT = 200;
export const SCORE_AREA_HEIGHT = 150;

// Tetraminos definitions
// Each tetramino is defined by relative positions from a pivot point (0, 0)
export const TETRAMINOS = {
  T: {
    blocks: [
      { x: -1, y: 0 },
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 }
    ],
    color: 0x9b59b6 // Purple
  },
  L: {
    blocks: [
      { x: -1, y: 0 },
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 }
    ],
    color: 0xf39c12 // Orange
  },
  J: {
    blocks: [
      { x: -1, y: 0 },
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: -1, y: 1 }
    ],
    color: 0x3498db // Blue
  },
  O: {
    blocks: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 }
    ],
    color: 0xf1c40f // Yellow
  },
  I: {
    blocks: [
      { x: -1, y: 0 },
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 }
    ],
    color: 0x1abc9c // Cyan
  },
  S: {
    blocks: [
      { x: -1, y: 1 },
      { x: 0, y: 1 },
      { x: 0, y: 0 },
      { x: 1, y: 0 }
    ],
    color: 0x2ecc71 // Green
  },
  Z: {
    blocks: [
      { x: -1, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 }
    ],
    color: 0xe74c3c // Red
  }
};

// Score data (points for clearing 1, 2, 3, or 4 lines)
export const SCORE_DATA = {
  1: 40,
  2: 100,
  3: 300,
  4: 1200
};

// Initial drop speed (milliseconds)
export const INITIAL_DROP_SPEED = 1000;

// Fast drop speed (30% of normal)
export const FAST_DROP_SPEED = 300;

// Speed multiplier per level (75% of previous)
export const LEVEL_SPEED_MULTIPLIER = 0.75;

// Lines per level
export const LINES_PER_LEVEL = 10;

