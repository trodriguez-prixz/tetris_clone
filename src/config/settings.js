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

export const VISUAL_SYSTEM = {
  palette: {
    surface: {
      page: 0x101820,
      board: 0x172635,
      panel: 0x1e3142,
      panelRaised: 0x263d52,
      overlay: 0x000000
    },
    border: {
      primary: 0x66e3ff,
      secondary: 0x2d5266,
      focus: 0xf7d154
    },
    text: {
      primary: '#f4fbff',
      secondary: '#b8c9d6',
      muted: '#8ea4b2',
      inverse: '#101820'
    },
    accent: {
      cyan: '#66e3ff',
      magenta: '#ff5fd7',
      yellow: '#f7d154',
      green: '#5dff9a',
      red: '#ff5d73'
    }
  },
  contrast: {
    bodyText: 4.5,
    largeText: 3,
    importantText: 7,
    nonText: 3
  },
  typography: {
    fontFamily: 'monospace',
    weight: {
      regular: 'normal',
      emphasis: 'bold'
    },
    size: {
      caption: '12px',
      body: '16px',
      metric: '20px',
      sectionTitle: '18px',
      overlayPrompt: '24px',
      overlayTitle: '64px'
    },
    lineHeight: {
      compact: 1.1,
      normal: 1.25
    }
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 20,
    xl: 32
  },
  borders: {
    thin: 1,
    normal: 2,
    strong: 4,
    radius: {
      none: 0,
      sm: 4,
      md: 8
    }
  },
  effects: {
    glow: {
      subtle: { color: '#66e3ff', alpha: 0.35, blur: 8 },
      strong: { color: '#ff5fd7', alpha: 0.6, blur: 16 }
    },
    shadow: {
      panel: {
        color: '#000000',
        alpha: 0.35,
        offsetX: 0,
        offsetY: 4,
        blur: 12
      },
      overlayText: {
        color: '#000000',
        alpha: 0.65,
        offsetX: 2,
        offsetY: 2,
        blur: 4
      }
    }
  }
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
