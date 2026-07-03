import { SIDEBAR_X, SIDEBAR_Y, SIDEBAR_WIDTH, PREVIEW_AREA_HEIGHT, PADDING, COLORS } from '../../config/settings.js';
import EventBus, { EVENTS } from '../../events/EventBus.js';
import { StorageManager } from '../../utils/storage.js';

const CENTER_ORIGIN = 0.5;
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

export default class ScoreDisplayRenderer {
  constructor(scene, gameState) {
    this.scene = scene;
    this.gameState = gameState;
    this.formatNumberCache = new Map();

    this.createUI();

    EventBus.on(EVENTS.SCORE_UPDATED, this.onScoreUpdated, this);
    EventBus.on(EVENTS.LEVEL_UP, this.onLevelUp, this);
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
  }
}
