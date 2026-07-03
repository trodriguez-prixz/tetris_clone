import { SIDEBAR_X, SIDEBAR_Y, SIDEBAR_WIDTH, PREVIEW_AREA_HEIGHT, SCORE_AREA_HEIGHT, PADDING, CANVAS_HEIGHT, TETRAMINOS, COLORS, PREVIEW_CELL_SIZE, PANEL_BORDER_WIDTH, RENDERED_BLOCK_INSET } from '../../config/settings.js';
import EventBus, { EVENTS } from '../../events/EventBus.js';
import { StorageManager } from '../../utils/storage.js';

const PANEL_BORDER_ALPHA = 1;
const CENTER_ORIGIN = 0.5;
const PREVIEW_SLOT_COUNT = 3;
const TEXT_UPDATE_SCALE = 1.15;
const TEXT_UPDATE_DURATION = 150;
const LEVEL_UP_SCALE = 1.3;
const LEVEL_UP_DURATION = 200;
const LEVEL_UP_FLASH_ALPHA = 0.3;
const LEVEL_UP_FLASH_DURATION = 100;
const TEXT_ANIMATION_EASE = 'Power2';
const NUMBER_FORMAT_CACHE_LIMIT = 1000;

const SCORE_TEXT_LAYOUT = {
  title: { offsetY: 15, fontSize: '18px' },
  score: { offsetY: 45, fontSize: '20px' },
  level: { offsetY: 75, fontSize: '20px' },
  lines: { offsetY: 100, fontSize: '20px' },
  highScore: { offsetY: 130, fontSize: '16px' },
  time: { offsetY: 155, fontSize: '16px' },
  pieces: { offsetY: 180, fontSize: '16px' },
  tetrises: { offsetY: 205, fontSize: '16px' }
};

const AUDIO_TEXT_LAYOUT = {
  controls: { offsetFromBottom: 20, fontSize: '12px' },
  soundEffects: { offsetFromBottom: 50, fontSize: '16px' },
  music: { offsetFromBottom: 75, fontSize: '16px' }
};

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
      COLORS.PANEL_BACKGROUND, COLORS.PANEL_BORDER
    );

    const scoreAreaY = SIDEBAR_Y + PREVIEW_AREA_HEIGHT + PADDING + SCORE_AREA_HEIGHT / 2;
    this.drawArea(
      SIDEBAR_X + SIDEBAR_WIDTH / 2,
      scoreAreaY,
      SIDEBAR_WIDTH - PADDING,
      SCORE_AREA_HEIGHT,
      COLORS.PANEL_BACKGROUND, COLORS.PANEL_BORDER
    );
  }

  drawArea(centerX, centerY, width, height, fillColor, strokeColor) {
    this.scene.add.rectangle(centerX, centerY, width, height, fillColor);
    const graphics = this.scene.add.graphics();
    graphics.lineStyle(PANEL_BORDER_WIDTH, strokeColor, PANEL_BORDER_ALPHA);
    graphics.strokeRect(centerX - width / 2, centerY - height / 2, width, height);
  }

  createUI() {
    const uiX = SIDEBAR_X + SIDEBAR_WIDTH / 2;
    const scoreAreaTop = SIDEBAR_Y + PREVIEW_AREA_HEIGHT + PADDING;

    this.scene.add.text(uiX, scoreAreaTop + SCORE_TEXT_LAYOUT.title.offsetY, 'STATS', { fontSize: SCORE_TEXT_LAYOUT.title.fontSize, fill: COLORS.HEADER_TEXT, fontStyle: 'bold' }).setOrigin(CENTER_ORIGIN);
    this.scoreText = this.scene.add.text(uiX, scoreAreaTop + SCORE_TEXT_LAYOUT.score.offsetY, 'Score: 0', { fontSize: SCORE_TEXT_LAYOUT.score.fontSize, fill: COLORS.PRIMARY_TEXT, fontStyle: 'bold' }).setOrigin(CENTER_ORIGIN);
    this.levelText = this.scene.add.text(uiX, scoreAreaTop + SCORE_TEXT_LAYOUT.level.offsetY, 'Level: 1', { fontSize: SCORE_TEXT_LAYOUT.level.fontSize, fill: COLORS.PRIMARY_TEXT, fontStyle: 'bold' }).setOrigin(CENTER_ORIGIN);
    this.linesText = this.scene.add.text(uiX, scoreAreaTop + SCORE_TEXT_LAYOUT.lines.offsetY, 'Lines: 0', { fontSize: SCORE_TEXT_LAYOUT.lines.fontSize, fill: COLORS.PRIMARY_TEXT, fontStyle: 'bold' }).setOrigin(CENTER_ORIGIN);

    const bestScore = StorageManager.getBestScore();
    this.highScoreText = this.scene.add.text(uiX, scoreAreaTop + SCORE_TEXT_LAYOUT.highScore.offsetY, `Best: ${this.formatNumber(bestScore)}`, { fontSize: SCORE_TEXT_LAYOUT.highScore.fontSize, fill: COLORS.WARNING, fontStyle: 'bold' }).setOrigin(CENTER_ORIGIN);
    
    this.timeText = this.scene.add.text(uiX, scoreAreaTop + SCORE_TEXT_LAYOUT.time.offsetY, 'Time: 0:00', { fontSize: SCORE_TEXT_LAYOUT.time.fontSize, fill: COLORS.SECONDARY_TEXT }).setOrigin(CENTER_ORIGIN);
    this.piecesText = this.scene.add.text(uiX, scoreAreaTop + SCORE_TEXT_LAYOUT.pieces.offsetY, 'Pieces: 0', { fontSize: SCORE_TEXT_LAYOUT.pieces.fontSize, fill: COLORS.SECONDARY_TEXT }).setOrigin(CENTER_ORIGIN);
    this.tetrisesText = this.scene.add.text(uiX, scoreAreaTop + SCORE_TEXT_LAYOUT.tetrises.offsetY, 'Tetrises: 0', { fontSize: SCORE_TEXT_LAYOUT.tetrises.fontSize, fill: COLORS.SECONDARY_TEXT }).setOrigin(CENTER_ORIGIN);

    const sidebarBottom = CANVAS_HEIGHT - PADDING;
    this.scene.add.text(uiX, sidebarBottom - AUDIO_TEXT_LAYOUT.controls.offsetFromBottom, 'M: Música | S: Sonidos', { fontSize: AUDIO_TEXT_LAYOUT.controls.fontSize, fill: COLORS.MUTED_TEXT }).setOrigin(CENTER_ORIGIN);
    this.soundEffectsIndicator = this.scene.add.text(uiX, sidebarBottom - AUDIO_TEXT_LAYOUT.soundEffects.offsetFromBottom, '🔊 Sonidos: ON', { fontSize: AUDIO_TEXT_LAYOUT.soundEffects.fontSize, fill: COLORS.SECONDARY_TEXT }).setOrigin(CENTER_ORIGIN);
    this.musicIndicator = this.scene.add.text(uiX, sidebarBottom - AUDIO_TEXT_LAYOUT.music.offsetFromBottom, '🔊 Música: ON', { fontSize: AUDIO_TEXT_LAYOUT.music.fontSize, fill: COLORS.SECONDARY_TEXT }).setOrigin(CENTER_ORIGIN);
  }

  formatNumber(num) {
    if (this.formatNumberCache.has(num)) return this.formatNumberCache.get(num);
    const formatted = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    if (this.formatNumberCache.size < NUMBER_FORMAT_CACHE_LIMIT) this.formatNumberCache.set(num, formatted);
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
          this.highScoreText.setFill(COLORS.DANGER);
      }
  }

  onLevelUp(newLevel) {
      this.levelText.setText(`Level: ${newLevel}`);
      this.animateLevelUp(this.levelText);
  }

  updateAudioIndicators(musicMuted, soundEnabled) {
      if (this.musicIndicator) {
        this.musicIndicator.setText(musicMuted ? '🔇 Música: OFF' : '🔊 Música: ON');
        this.musicIndicator.setFill(musicMuted ? COLORS.DANGER : COLORS.SUCCESS);
      }
      if (this.soundEffectsIndicator) {
        this.soundEffectsIndicator.setText(!soundEnabled ? '🔇 Sonidos: OFF' : '🔊 Sonidos: ON');
        this.soundEffectsIndicator.setFill(!soundEnabled ? COLORS.DANGER : COLORS.SUCCESS);
      }
  }

  renderPreview() {
    this.previewBlocks.forEach(block => block.destroy());
    this.previewBlocks = [];
    
    const previewAreaWidth = SIDEBAR_WIDTH - PADDING;
    const previewAreaLeft = SIDEBAR_X + PADDING / 2;
    const segmentHeight = (PREVIEW_AREA_HEIGHT - PADDING * 2) / PREVIEW_SLOT_COUNT;
    const cellSize = PREVIEW_CELL_SIZE;
    
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
        this.previewBlocks.push(this.scene.add.rectangle(x, y, cellSize - RENDERED_BLOCK_INSET, cellSize - RENDERED_BLOCK_INSET, tetData.color));
      });
    });
  }

  animateTextUpdate(textObject) {
    this.scene.tweens.add({ targets: textObject, scaleX: TEXT_UPDATE_SCALE, scaleY: TEXT_UPDATE_SCALE, duration: TEXT_UPDATE_DURATION, yoyo: true, ease: TEXT_ANIMATION_EASE });
  }

  animateLevelUp(textObject) {
    this.scene.tweens.add({
      targets: textObject, scaleX: LEVEL_UP_SCALE, scaleY: LEVEL_UP_SCALE, duration: LEVEL_UP_DURATION, yoyo: true, ease: TEXT_ANIMATION_EASE,
      onComplete: () => this.scene.tweens.add({ targets: textObject, alpha: LEVEL_UP_FLASH_ALPHA, duration: LEVEL_UP_FLASH_DURATION, yoyo: true })
    });
  }

  destroy() {
      EventBus.off(EVENTS.SCORE_UPDATED, this.onScoreUpdated, this);
      EventBus.off(EVENTS.LEVEL_UP, this.onLevelUp, this);
      EventBus.off(EVENTS.NEXT_SHAPE_UPDATED, this.renderPreview, this);
      this.previewBlocks.forEach(block => block.destroy());
  }
}
