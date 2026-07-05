import {
  CELL_SIZE,
  GAME_AREA_X,
  GAME_AREA_Y,
  GAME_AREA_WIDTH,
  GAME_AREA_HEIGHT,
  GRID_COLS,
  GRID_ROWS,
  PANEL_BORDER_WIDTH,
  RENDERED_BLOCK_INSET,
  VISUAL_SYSTEM
} from '../../config/settings.js';
import EventBus, { EVENTS } from '../../events/EventBus.js';

const CENTER_ORIGIN = 0.5;
const GRID_LINE_WIDTH = VISUAL_SYSTEM.borders.thin;
const CLEARED_BLOCK_SHRINK_SCALE = 0.65;
const CLEARED_BLOCK_FADE_ALPHA = 0;
const CLEARED_BLOCK_FADE_DURATION = 120;
const PARTICLE_JITTER_ORIGIN = 0.5;
const PARTICLE_SIZE_RATIO = 0.22;
const PARTICLE_DISTANCE_TIME_SCALE = 0.35;
const PARTICLE_ALPHA_START = 0.85;
const PARTICLE_ALPHA_END = 0;
const PARTICLE_BASE_DURATION = 320;
const PARTICLE_RANDOM_DURATION = 120;
const FULL_CIRCLE_RADIANS = Math.PI * 2;
const PARTICLE_EASE = 'Power2';
const BLOCK_VISUAL_STYLES = {
  locked: {
    strokeWidth: VISUAL_SYSTEM.borders.thin,
    strokeColor: VISUAL_SYSTEM.palette.border.secondary,
    strokeAlpha: VISUAL_SYSTEM.borders.alpha.blockStroke,
    fillAlpha: 1
  },
  active: {
    strokeWidth: VISUAL_SYSTEM.borders.normal,
    strokeColor: VISUAL_SYSTEM.palette.border.focus,
    strokeAlpha: 1,
    fillAlpha: 1
  },
  ghost: {
    strokeWidth: VISUAL_SYSTEM.borders.normal,
    strokeColor: VISUAL_SYSTEM.palette.border.focus,
    strokeAlpha: 0.85,
    fillAlpha: 0.22
  }
};

const LINE_CLEAR_EFFECTS = {
  1: {
    particleCount: 10,
    colors: [0x3498db, 0x2980b9],
    speed: { min: 50, max: 150 },
    scale: { start: 0.45, end: 0 }
  },
  2: {
    particleCount: 16,
    colors: [0x2ecc71, 0x27ae60],
    speed: { min: 80, max: 200 },
    scale: { start: 0.5, end: 0 }
  },
  3: {
    particleCount: 20,
    colors: [0xf39c12, 0xe67e22],
    speed: { min: 100, max: 250 },
    scale: { start: 0.55, end: 0 }
  },
  4: {
    particleCount: 24,
    colors: [0xe74c3c, 0xc0392b, 0xf1c40f, 0xf39c12],
    speed: { min: 150, max: 300 },
    scale: { start: 0.6, end: 0 }
  }
};

export default class BoardRenderer {
  constructor(scene, gameState) {
    this.scene = scene;
    this.gameState = gameState;
    // Track locked block objects so removed rows can animate before their rectangles are destroyed.
    this.visualBlocks = new Map();
    this.activeBlocks = [];
    this.ghostBlocks = [];

    this.drawBackground();

    EventBus.on(EVENTS.LINES_CLEARED, this.handleLinesCleared, this);
  }

  drawBackground() {
    this.drawArea(
      GAME_AREA_X + GAME_AREA_WIDTH / 2,
      GAME_AREA_Y + GAME_AREA_HEIGHT / 2,
      GAME_AREA_WIDTH,
      GAME_AREA_HEIGHT,
      VISUAL_SYSTEM.palette.surface.board,
      VISUAL_SYSTEM.palette.border.primary
    );
    this.drawGridLines();
  }

  drawArea(centerX, centerY, width, height, fillColor, strokeColor) {
    this.scene.add.rectangle(centerX, centerY, width, height, fillColor);
    const graphics = this.scene.add.graphics();
    graphics.lineStyle(
      PANEL_BORDER_WIDTH,
      strokeColor,
      VISUAL_SYSTEM.borders.alpha.panel
    );
    graphics.strokeRect(
      centerX - width / 2,
      centerY - height / 2,
      width,
      height
    );
  }

  drawGridLines() {
    const graphics = this.scene.add.graphics();
    const gridLineColor = VISUAL_SYSTEM.palette.border.secondary;
    graphics.lineStyle(
      GRID_LINE_WIDTH,
      gridLineColor,
      VISUAL_SYSTEM.borders.alpha.grid
    );

    for (let col = 0; col <= GRID_COLS; col++) {
      const x = GAME_AREA_X + col * CELL_SIZE;
      graphics.moveTo(x, GAME_AREA_Y);
      graphics.lineTo(x, GAME_AREA_Y + GAME_AREA_HEIGHT);
    }

    for (let row = 0; row <= GRID_ROWS; row++) {
      const y = GAME_AREA_Y + row * CELL_SIZE;
      graphics.moveTo(GAME_AREA_X, y);
      graphics.lineTo(GAME_AREA_X + GAME_AREA_WIDTH, y);
    }
    graphics.strokePath();
  }

  createVisualBlock(
    logicalX,
    logicalY,
    color,
    style = BLOCK_VISUAL_STYLES.locked
  ) {
    const pixelX = GAME_AREA_X + logicalX * CELL_SIZE + CELL_SIZE / 2;
    const pixelY = GAME_AREA_Y + logicalY * CELL_SIZE + CELL_SIZE / 2;
    const rect = this.scene.add.rectangle(
      pixelX,
      pixelY,
      CELL_SIZE - RENDERED_BLOCK_INSET,
      CELL_SIZE - RENDERED_BLOCK_INSET,
      color
    );
    rect.setOrigin(CENTER_ORIGIN, CENTER_ORIGIN);
    rect.setAlpha(style.fillAlpha);
    rect.setStrokeStyle(
      style.strokeWidth,
      style.strokeColor,
      style.strokeAlpha
    );
    return rect;
  }

  update() {
    this.ghostBlocks.forEach((b) => b.destroy());
    this.activeBlocks.forEach((b) => b.destroy());
    this.ghostBlocks = [];
    this.activeBlocks = [];

    const activeTetra = this.gameState.currentTetramino;
    if (activeTetra) {
      this.drawGhostBlocks(activeTetra);
      activeTetra.blocks.forEach((lb) => {
        const visual = this.createVisualBlock(
          lb.x,
          lb.y,
          lb.color,
          BLOCK_VISUAL_STYLES.active
        );
        this.activeBlocks.push(visual);
      });
    }

    this.syncFieldData();
  }

  drawGhostBlocks(activeTetra) {
    const landingOffset = this.getLandingOffset(activeTetra);
    if (landingOffset === 0) return;

    activeTetra.blocks.forEach((lb) => {
      const ghost = this.createVisualBlock(
        lb.x,
        lb.y + landingOffset,
        lb.color,
        BLOCK_VISUAL_STYLES.ghost
      );
      this.ghostBlocks.push(ghost);
    });
  }

  getLandingOffset(activeTetra) {
    let offset = 0;
    const positions = activeTetra.blocks.map((block) => ({
      x: block.x,
      y: block.y
    }));

    while (!this.wouldCollideVertically(positions, offset + 1)) {
      offset += 1;
    }

    return offset;
  }

  wouldCollideVertically(positions, offset) {
    return positions.some(({ x, y }) => {
      const targetY = y + offset;
      return (
        targetY >= GRID_ROWS ||
        (this.gameState.fieldData[targetY] &&
          this.gameState.fieldData[targetY][x] !== null)
      );
    });
  }

  syncFieldData() {
    const currentLogicBlocks = new Set();
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        const lb = this.gameState.fieldData[r][c];
        if (lb) {
          currentLogicBlocks.add(lb);
          if (!this.visualBlocks.has(lb)) {
            this.visualBlocks.set(
              lb,
              this.createVisualBlock(lb.x, lb.y, lb.color)
            );
          } else {
            const visualBlock = this.visualBlocks.get(lb);
            visualBlock.x = GAME_AREA_X + lb.x * CELL_SIZE + CELL_SIZE / 2;
            visualBlock.y = GAME_AREA_Y + lb.y * CELL_SIZE + CELL_SIZE / 2;
          }
        }
      }
    }

    for (const [lb, vb] of this.visualBlocks.entries()) {
      if (!currentLogicBlocks.has(lb)) {
        // Animate removed locked blocks so cleared rows fade instead of disappearing.
        this.scene.tweens.add({
          targets: vb,
          scaleX: CLEARED_BLOCK_SHRINK_SCALE,
          scaleY: CLEARED_BLOCK_SHRINK_SCALE,
          alpha: CLEARED_BLOCK_FADE_ALPHA,
          duration: CLEARED_BLOCK_FADE_DURATION,
          onComplete: () => vb.destroy()
        });
        this.visualBlocks.delete(lb);
      }
    }
  }

  handleLinesCleared({ rows } = {}) {
    if (!rows) return;
    rows.forEach((row) => {
      this.createLineClearParticles(row, rows.length);
    });
  }

  createLineClearParticles(row, linesCleared) {
    const rowY = GAME_AREA_Y + row * CELL_SIZE + CELL_SIZE / 2;
    const { particleCount, colors, speed, scale } =
      LINE_CLEAR_EFFECTS[linesCleared] ?? LINE_CLEAR_EFFECTS[4];

    for (let col = 0; col < GRID_COLS; col++) {
      const colX = GAME_AREA_X + col * CELL_SIZE + CELL_SIZE / 2;
      const particlesPerBlock = Math.floor(particleCount / GRID_COLS);

      for (let i = 0; i < particlesPerBlock; i++) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        const angle = Math.random() * FULL_CIRCLE_RADIANS;
        const velocity = speed.min + Math.random() * (speed.max - speed.min);
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;

        const particle = this.scene.add.rectangle(
          colX + (Math.random() - PARTICLE_JITTER_ORIGIN) * CELL_SIZE,
          rowY + (Math.random() - PARTICLE_JITTER_ORIGIN) * CELL_SIZE,
          CELL_SIZE * PARTICLE_SIZE_RATIO,
          CELL_SIZE * PARTICLE_SIZE_RATIO,
          color
        );

        this.scene.tweens.add({
          targets: particle,
          x: particle.x + vx * PARTICLE_DISTANCE_TIME_SCALE,
          y: particle.y + vy * PARTICLE_DISTANCE_TIME_SCALE,
          alpha: { from: PARTICLE_ALPHA_START, to: PARTICLE_ALPHA_END },
          scale: { from: scale.start, to: scale.end },
          duration:
            PARTICLE_BASE_DURATION + Math.random() * PARTICLE_RANDOM_DURATION,
          ease: PARTICLE_EASE,
          onComplete: () => particle.destroy()
        });
      }
    }
  }

  destroy() {
    EventBus.off(EVENTS.LINES_CLEARED, this.handleLinesCleared, this);
    this.visualBlocks.forEach((vb) => vb.destroy());
    this.ghostBlocks.forEach((b) => b.destroy());
    this.activeBlocks.forEach((b) => b.destroy());
  }
}
