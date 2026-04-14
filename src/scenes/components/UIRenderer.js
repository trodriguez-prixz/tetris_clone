import { SIDEBAR_X, SIDEBAR_Y, SIDEBAR_WIDTH, PREVIEW_AREA_HEIGHT, SCORE_AREA_HEIGHT, PADDING, CANVAS_HEIGHT, TETRAMINOS } from '../../config/settings.js';
import EventBus, { EVENTS } from '../../events/EventBus.js';
import { StorageManager } from '../../utils/storage.js';

export default class UIRenderer {
  constructor(scene, gameState) {
    this.scene = scene;
    this.gameState = gameState;
    this.formatNumberCache = new Map();
    this.previewBlocks = [];
    
    // UI Elements
    this.scoreText = null;
    this.levelText = null;
    this.linesText = null;
    this.highScoreText = null;
    this.timeText = null;
    this.piecesText = null;
    this.tetrisesText = null;
    
    this.createBackgrounds();
    this.createUI();
    
    // Listen to changes
    EventBus.on(EVENTS.SCORE_UPDATED, this.onScoreUpdated, this);
    EventBus.on(EVENTS.LEVEL_UP, this.onLevelUp, this);
    EventBus.on(EVENTS.NEXT_SHAPE_UPDATED, this.renderPreview, this);
  }
  
  createBackgrounds() {
    this.drawArea(
      SIDEBAR_X + SIDEBAR_WIDTH / 2,
      SIDEBAR_Y + PREVIEW_AREA_HEIGHT / 2,
      SIDEBAR_WIDTH - PADDING,
      PREVIEW_AREA_HEIGHT,
      0x2c3e50, 0xecf0f1
    );

    const scoreAreaY = SIDEBAR_Y + PREVIEW_AREA_HEIGHT + PADDING + SCORE_AREA_HEIGHT / 2;
    this.drawArea(
      SIDEBAR_X + SIDEBAR_WIDTH / 2,
      scoreAreaY,
      SIDEBAR_WIDTH - PADDING,
      SCORE_AREA_HEIGHT,
      0x2c3e50, 0xecf0f1
    );
  }

  drawArea(centerX, centerY, width, height, fillColor, strokeColor) {
    this.scene.add.rectangle(centerX, centerY, width, height, fillColor);
    const graphics = this.scene.add.graphics();
    graphics.lineStyle(2, strokeColor, 1);
    graphics.strokeRect(centerX - width / 2, centerY - height / 2, width, height);
  }

  createUI() {
    const uiX = SIDEBAR_X + SIDEBAR_WIDTH / 2;
    const scoreAreaTop = SIDEBAR_Y + PREVIEW_AREA_HEIGHT + PADDING;

    this.scene.add.text(uiX, scoreAreaTop + 15, 'STATS', { fontSize: '18px', fill: '#bdc3c7', fontStyle: 'bold' }).setOrigin(0.5);
    this.scoreText = this.scene.add.text(uiX, scoreAreaTop + 45, 'Score: 0', { fontSize: '20px', fill: '#ecf0f1', fontStyle: 'bold' }).setOrigin(0.5);
    this.levelText = this.scene.add.text(uiX, scoreAreaTop + 75, 'Level: 1', { fontSize: '20px', fill: '#ecf0f1', fontStyle: 'bold' }).setOrigin(0.5);
    this.linesText = this.scene.add.text(uiX, scoreAreaTop + 100, 'Lines: 0', { fontSize: '20px', fill: '#ecf0f1', fontStyle: 'bold' }).setOrigin(0.5);

    const bestScore = StorageManager.getBestScore();
    this.highScoreText = this.scene.add.text(uiX, scoreAreaTop + 130, `Best: ${this.formatNumber(bestScore)}`, { fontSize: '16px', fill: '#f39c12', fontStyle: 'bold' }).setOrigin(0.5);
    
    this.timeText = this.scene.add.text(uiX, scoreAreaTop + 155, 'Time: 0:00', { fontSize: '16px', fill: '#95a5a6' }).setOrigin(0.5);
    this.piecesText = this.scene.add.text(uiX, scoreAreaTop + 180, 'Pieces: 0', { fontSize: '16px', fill: '#95a5a6' }).setOrigin(0.5);
    this.tetrisesText = this.scene.add.text(uiX, scoreAreaTop + 205, 'Tetrises: 0', { fontSize: '16px', fill: '#95a5a6' }).setOrigin(0.5);

    const sidebarBottom = CANVAS_HEIGHT - PADDING;
    this.scene.add.text(uiX, sidebarBottom - 20, 'M: Música | S: Sonidos', { fontSize: '12px', fill: '#7f8c8d' }).setOrigin(0.5);
    this.soundEffectsIndicator = this.scene.add.text(uiX, sidebarBottom - 50, '🔊 Sonidos: ON', { fontSize: '16px', fill: '#95a5a6' }).setOrigin(0.5);
    this.musicIndicator = this.scene.add.text(uiX, sidebarBottom - 75, '🔊 Música: ON', { fontSize: '16px', fill: '#95a5a6' }).setOrigin(0.5);
  }

  formatNumber(num) {
    if (this.formatNumberCache.has(num)) return this.formatNumberCache.get(num);
    const formatted = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    if (this.formatNumberCache.size < 1000) this.formatNumberCache.set(num, formatted);
    return formatted;
  }

  updateTime(time) {
      this.timeText.setText(`Time: ${this.gameState.score.formatTime(time)}`);
  }

  onScoreUpdated(stats) {
      if (this.scoreText.text !== `Score: ${this.formatNumber(stats.score)}`) {
          this.scoreText.setText(`Score: ${this.formatNumber(stats.score)}`);
          this.animateTextUpdate(this.scoreText);
      }
      this.linesText.setText(`Lines: ${this.formatNumber(stats.lines)}`);
      this.piecesText.setText(`Pieces: ${stats.pieces}`);
      this.tetrisesText.setText(`Tetrises: ${stats.tetrises}`);
      
      const bestScore = StorageManager.getBestScore();
      if (stats.score > bestScore) {
          this.highScoreText.setText(`Best: ${this.formatNumber(stats.score)}`);
          this.highScoreText.setFill('#e74c3c');
      }
  }

  onLevelUp(newLevel) {
      this.levelText.setText(`Level: ${newLevel}`);
      this.animateLevelUp(this.levelText);
  }

  updateAudioIndicators(musicMuted, soundEnabled) {
      if (this.musicIndicator) {
        this.musicIndicator.setText(musicMuted ? '🔇 Música: OFF' : '🔊 Música: ON');
        this.musicIndicator.setFill(musicMuted ? '#e74c3c' : '#2ecc71');
      }
      if (this.soundEffectsIndicator) {
        this.soundEffectsIndicator.setText(!soundEnabled ? '🔇 Sonidos: OFF' : '🔊 Sonidos: ON');
        this.soundEffectsIndicator.setFill(!soundEnabled ? '#e74c3c' : '#2ecc71');
      }
  }

  renderPreview() {
    this.previewBlocks.forEach(block => block.destroy());
    this.previewBlocks = [];
    
    const previewAreaWidth = SIDEBAR_WIDTH - PADDING;
    const previewAreaLeft = SIDEBAR_X + PADDING / 2;
    const segmentHeight = (PREVIEW_AREA_HEIGHT - PADDING * 2) / 3;
    const cellSize = 20;
    
    this.gameState.nextShapes.forEach((shapeType, index) => {
      const tetData = TETRAMINOS[shapeType];
      const segmentCenterY = SIDEBAR_Y + PADDING + (index * segmentHeight) + (segmentHeight / 2);
      
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      tetData.blocks.forEach(p => {
        minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
        minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
      });
      
      const offsetX = (previewAreaWidth - ((maxX - minX + 1) * cellSize)) / 2;
      const offsetY = (segmentHeight - ((maxY - minY + 1) * cellSize)) / 2;
      
      tetData.blocks.forEach(p => {
        const x = previewAreaLeft + offsetX + ((p.x - minX) * cellSize) + (cellSize / 2);
        const y = segmentCenterY + offsetY + ((p.y - minY) * cellSize) + (cellSize / 2);
        this.previewBlocks.push(this.scene.add.rectangle(x, y, cellSize - 2, cellSize - 2, tetData.color));
      });
    });
  }

  animateTextUpdate(textObject) {
    this.scene.tweens.add({ targets: textObject, scaleX: 1.15, scaleY: 1.15, duration: 150, yoyo: true, ease: 'Power2' });
  }

  animateLevelUp(textObject) {
    this.scene.tweens.add({
      targets: textObject, scaleX: 1.3, scaleY: 1.3, duration: 200, yoyo: true, ease: 'Power2',
      onComplete: () => this.scene.tweens.add({ targets: textObject, alpha: 0.3, duration: 100, yoyo: true })
    });
  }

  destroy() {
      EventBus.off(EVENTS.SCORE_UPDATED, this.onScoreUpdated, this);
      EventBus.off(EVENTS.LEVEL_UP, this.onLevelUp, this);
      EventBus.off(EVENTS.NEXT_SHAPE_UPDATED, this.renderPreview, this);
      this.previewBlocks.forEach(block => block.destroy());
  }
}
