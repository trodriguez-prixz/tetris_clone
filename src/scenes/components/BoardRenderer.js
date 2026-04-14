import { CELL_SIZE, GAME_AREA_X, GAME_AREA_Y, GAME_AREA_WIDTH, GAME_AREA_HEIGHT, GRID_COLS, GRID_ROWS } from '../../config/settings.js';
import EventBus, { EVENTS } from '../../events/EventBus.js';

export default class BoardRenderer {
  constructor(scene, gameState) {
    this.scene = scene;
    this.gameState = gameState;
    this.visualBlocks = new Map(); // map logic Block reference -> Phaser Rectangle
    this.activeBlocks = []; // Phaser Rectangles for the falling piece
    
    this.drawBackground();
    
    // Listeners
    EventBus.on(EVENTS.TETRAMINO_LOCKED, this.handleTetraminoLocked, this);
    EventBus.on(EVENTS.LINES_CLEARED, this.handleLinesCleared, this);
  }
  
  drawBackground() {
    this.drawArea(
      GAME_AREA_X + GAME_AREA_WIDTH / 2,
      GAME_AREA_Y + GAME_AREA_HEIGHT / 2,
      GAME_AREA_WIDTH,
      GAME_AREA_HEIGHT,
      0x2c3e50,
      0xecf0f1
    );
    this.drawGridLines();
  }

  drawArea(centerX, centerY, width, height, fillColor, strokeColor) {
    this.scene.add.rectangle(centerX, centerY, width, height, fillColor);
    const graphics = this.scene.add.graphics();
    graphics.lineStyle(2, strokeColor, 1);
    graphics.strokeRect(centerX - width / 2, centerY - height / 2, width, height);
  }

  drawGridLines() {
    const graphics = this.scene.add.graphics();
    const gridLineColor = 0x34495e;
    const gridLineAlpha = 0.3;
    const gridLineWidth = 1;

    graphics.lineStyle(gridLineWidth, gridLineColor, gridLineAlpha);

    for (let col = 0; col <= GRID_COLS; col++) {
      const x = GAME_AREA_X + (col * CELL_SIZE);
      graphics.moveTo(x, GAME_AREA_Y);
      graphics.lineTo(x, GAME_AREA_Y + GAME_AREA_HEIGHT);
    }

    for (let row = 0; row <= GRID_ROWS; row++) {
      const y = GAME_AREA_Y + (row * CELL_SIZE);
      graphics.moveTo(GAME_AREA_X, y);
      graphics.lineTo(GAME_AREA_X + GAME_AREA_WIDTH, y);
    }
    graphics.strokePath();
  }
  
  createVisualBlock(logicalX, logicalY, color) {
    const pixelX = GAME_AREA_X + (logicalX * CELL_SIZE) + (CELL_SIZE / 2);
    const pixelY = GAME_AREA_Y + (logicalY * CELL_SIZE) + (CELL_SIZE / 2);
    const rect = this.scene.add.rectangle(pixelX, pixelY, CELL_SIZE - 2, CELL_SIZE - 2, color);
    rect.setOrigin(0.5, 0.5);
    return rect;
  }
  
  update() {
    // Clear old active blocks visually
    this.activeBlocks.forEach(b => b.destroy());
    this.activeBlocks = [];
    
    // Draw falling piece
    const activeTetra = this.gameState.currentTetramino;
    if (activeTetra) {
      activeTetra.blocks.forEach(lb => {
        const visual = this.createVisualBlock(lb.x, lb.y, lb.color);
        this.activeBlocks.push(visual);
      });
    }
    
    this.syncFieldData();
  }
  
  syncFieldData() {
     const currentLogicBlocks = new Set();
     for (let r=0; r<GRID_ROWS; r++) {
         for (let c=0; c<GRID_COLS; c++) {
             const lb = this.gameState.fieldData[r][c];
             if (lb) {
                 currentLogicBlocks.add(lb);
                 if (!this.visualBlocks.has(lb)) {
                     this.visualBlocks.set(lb, this.createVisualBlock(lb.x, lb.y, lb.color));
                 } else {
                     const visualBlock = this.visualBlocks.get(lb);
                     visualBlock.x = GAME_AREA_X + (lb.x * CELL_SIZE) + (CELL_SIZE / 2);
                     visualBlock.y = GAME_AREA_Y + (lb.y * CELL_SIZE) + (CELL_SIZE / 2);
                 }
             }
         }
     }
     
     // Remove old
     for (const [lb, vb] of this.visualBlocks.entries()) {
         if (!currentLogicBlocks.has(lb)) {
             
             // Animated destroy
             this.scene.tweens.add({
                 targets: vb,
                 scaleX: 0.5,
                 scaleY: 0.5,
                 alpha: 0,
                 duration: 150,
                 onComplete: () => vb.destroy()
             });
             this.visualBlocks.delete(lb);
         }
     }
  }

  handleTetraminoLocked(blocks) {
      // Visual feedback for locking could go here, e.g. a small flash
  }
  
  handleLinesCleared(rows) {
      rows.forEach(row => {
          this.createLineClearParticles(row, rows.length);
      });
  }

  createLineClearParticles(row, linesCleared) {
    const rowY = GAME_AREA_Y + (row * CELL_SIZE) + (CELL_SIZE / 2);
    let particleCount, colors, speed, scale;
    
    if (linesCleared === 1) {
      particleCount = 20; colors = [0x3498db, 0x2980b9]; speed = { min: 50, max: 150 }; scale = { start: 0.5, end: 0 };
    } else if (linesCleared === 2) {
      particleCount = 30; colors = [0x2ecc71, 0x27ae60]; speed = { min: 80, max: 200 }; scale = { start: 0.6, end: 0 };
    } else if (linesCleared === 3) {
      particleCount = 40; colors = [0xf39c12, 0xe67e22]; speed = { min: 100, max: 250 }; scale = { start: 0.7, end: 0 };
    } else {
      particleCount = 60; colors = [0xe74c3c, 0xc0392b, 0xf1c40f, 0xf39c12]; speed = { min: 150, max: 300 }; scale = { start: 0.8, end: 0 };
    }
    
    for (let col = 0; col < GRID_COLS; col++) {
      const colX = GAME_AREA_X + (col * CELL_SIZE) + (CELL_SIZE / 2);
      const particlesPerBlock = Math.floor(particleCount / GRID_COLS);
      
      for (let i = 0; i < particlesPerBlock; i++) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        const angle = (Math.random() * Math.PI * 2);
        const velocity = speed.min + Math.random() * (speed.max - speed.min);
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;
        
        const particle = this.scene.add.rectangle(
          colX + (Math.random() - 0.5) * CELL_SIZE,
          rowY + (Math.random() - 0.5) * CELL_SIZE,
          CELL_SIZE * 0.3,
          CELL_SIZE * 0.3,
          color
        );
        
        this.scene.tweens.add({
          targets: particle,
          x: particle.x + vx * 0.5,
          y: particle.y + vy * 0.5,
          alpha: { from: 1, to: 0 },
          scale: { from: scale.start, to: scale.end },
          duration: 500 + Math.random() * 300,
          ease: 'Power2',
          onComplete: () => particle.destroy()
        });
      }
    }
  }

  destroy() {
      EventBus.off(EVENTS.TETRAMINO_LOCKED, this.handleTetraminoLocked, this);
      EventBus.off(EVENTS.LINES_CLEARED, this.handleLinesCleared, this);
      this.visualBlocks.forEach(vb => vb.destroy());
      this.activeBlocks.forEach(b => b.destroy());
  }
}
