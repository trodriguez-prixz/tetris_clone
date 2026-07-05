import {
  SIDEBAR_X,
  SIDEBAR_Y,
  SIDEBAR_WIDTH,
  PREVIEW_AREA_HEIGHT,
  PADDING,
  VISUAL_SYSTEM
} from '../../config/settings.js';
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

const SCORE_TEXT_SPACING = VISUAL_SYSTEM.spacing;
const SCORE_TEXT_GROUP_GAP = SCORE_TEXT_SPACING.lg + SCORE_TEXT_SPACING.md;
const SCORE_TEXT_METRIC_STEP = SCORE_TEXT_SPACING.lg + SCORE_TEXT_SPACING.sm;
const SCORE_TEXT_STAT_STEP = SCORE_TEXT_SPACING.lg + SCORE_TEXT_SPACING.xs;
const CURRENT_LABEL_Y = SCORE_TEXT_SPACING.xl + SCORE_TEXT_SPACING.sm;
const SCORE_Y = CURRENT_LABEL_Y + SCORE_TEXT_SPACING.lg + SCORE_TEXT_SPACING.xs;
const LEVEL_Y = SCORE_Y + SCORE_TEXT_METRIC_STEP;
const LINES_Y = LEVEL_Y + SCORE_TEXT_METRIC_STEP;
const SESSION_LABEL_Y = LINES_Y + SCORE_TEXT_GROUP_GAP;
const TIME_Y = SESSION_LABEL_Y + SCORE_TEXT_STAT_STEP;
const PIECES_Y = TIME_Y + SCORE_TEXT_STAT_STEP;
const TETRISES_Y = PIECES_Y + SCORE_TEXT_STAT_STEP;
const RECORD_LABEL_Y = TETRISES_Y + SCORE_TEXT_GROUP_GAP;
const HIGH_SCORE_Y = RECORD_LABEL_Y + SCORE_TEXT_SPACING.lg;

const SCORE_TEXT_LAYOUT = {
  title: { offsetY: SCORE_TEXT_SPACING.md, hierarchy: 'title' },
  currentLabel: {
    offsetY: CURRENT_LABEL_Y,
    hierarchy: 'groupLabel'
  },
  score: { offsetY: SCORE_Y, hierarchy: 'primaryMetric' },
  level: { offsetY: LEVEL_Y, hierarchy: 'primaryMetric' },
  lines: { offsetY: LINES_Y, hierarchy: 'primaryMetric' },
  sessionLabel: {
    offsetY: SESSION_LABEL_Y,
    hierarchy: 'groupLabel'
  },
  time: { offsetY: TIME_Y, hierarchy: 'supportMetric' },
  pieces: { offsetY: PIECES_Y, hierarchy: 'secondaryMetric' },
  tetrises: { offsetY: TETRISES_Y, hierarchy: 'secondaryMetric' },
  recordLabel: {
    offsetY: RECORD_LABEL_Y,
    hierarchy: 'groupLabel'
  },
  highScore: {
    offsetY: HIGH_SCORE_Y,
    hierarchy: 'supportMetric'
  }
};

const SCORE_TEXT_HIERARCHY = {
  title: {
    fontSize: VISUAL_SYSTEM.typography.size.sectionTitle,
    fill: VISUAL_SYSTEM.palette.accent.cyan,
    fontStyle: VISUAL_SYSTEM.typography.weight.emphasis
  },
  groupLabel: {
    fontSize: VISUAL_SYSTEM.typography.size.caption,
    fill: VISUAL_SYSTEM.palette.text.secondary,
    fontStyle: VISUAL_SYSTEM.typography.weight.emphasis
  },
  primaryMetric: {
    fontSize: VISUAL_SYSTEM.typography.size.metric,
    fill: VISUAL_SYSTEM.palette.text.primary,
    fontStyle: VISUAL_SYSTEM.typography.weight.emphasis
  },
  supportMetric: {
    fontSize: VISUAL_SYSTEM.typography.size.body,
    fill: VISUAL_SYSTEM.palette.text.secondary,
    fontStyle: VISUAL_SYSTEM.typography.weight.regular
  },
  secondaryMetric: {
    fontSize: VISUAL_SYSTEM.typography.size.body,
    fill: VISUAL_SYSTEM.palette.text.muted,
    fontStyle: VISUAL_SYSTEM.typography.weight.regular
  }
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

    this.createScoreText(uiX, scoreAreaTop, 'title', 'STATS');
    this.createScoreText(uiX, scoreAreaTop, 'currentLabel', 'CURRENT RUN');
    this.scoreText = this.createScoreText(uiX, scoreAreaTop, 'score', 'Score: 0');
    this.levelText = this.createScoreText(uiX, scoreAreaTop, 'level', 'Level: 1');
    this.linesText = this.createScoreText(uiX, scoreAreaTop, 'lines', 'Lines: 0');

    this.createScoreText(uiX, scoreAreaTop, 'sessionLabel', 'SESSION STATS');
    this.timeText = this.createScoreText(
      uiX,
      scoreAreaTop,
      'time',
      'Elapsed: 0:00'
    );
    this.piecesText = this.createScoreText(
      uiX,
      scoreAreaTop,
      'pieces',
      'Pieces: 0'
    );
    this.tetrisesText = this.createScoreText(
      uiX,
      scoreAreaTop,
      'tetrises',
      'Tetrises: 0'
    );

    const bestScore = StorageManager.getBestScore();
    this.createScoreText(uiX, scoreAreaTop, 'recordLabel', 'RECORD');
    this.highScoreText = this.createScoreText(
      uiX,
      scoreAreaTop,
      'highScore',
      `Best Score: ${this.formatNumber(bestScore)}`
    );
  }

  createScoreText(uiX, scoreAreaTop, layoutKey, content) {
    const layout = SCORE_TEXT_LAYOUT[layoutKey];
    const hierarchyStyle = SCORE_TEXT_HIERARCHY[layout.hierarchy];

    return this.scene.add
      .text(uiX, scoreAreaTop + layout.offsetY, content, {
        fontFamily: VISUAL_SYSTEM.typography.fontFamily,
        ...hierarchyStyle
      })
      .setOrigin(CENTER_ORIGIN);
  }

  formatNumber(num) {
    if (this.formatNumberCache.has(num)) return this.formatNumberCache.get(num);
    const formatted = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    if (this.formatNumberCache.size < NUMBER_FORMAT_CACHE_LIMIT)
      this.formatNumberCache.set(num, formatted);
    return formatted;
  }

  updateTime(time) {
    this.timeText.setText(`Elapsed: ${this.gameState.score.formatTime(time)}`);
  }

  onScoreUpdated({ stats } = {}) {
    if (!stats) return;

    if (this.scoreText.text !== `Score: ${this.formatNumber(stats.score)}`) {
      this.scoreText.setText(`Score: ${this.formatNumber(stats.score)}`);
      this.animateTextUpdate(this.scoreText);
    }
    this.linesText.setText(`Lines: ${this.formatNumber(stats.lines)}`);
    this.piecesText.setText(`Pieces: ${stats.pieces}`);
    this.tetrisesText.setText(`Tetrises: ${stats.tetrises}`);

    const bestScore = StorageManager.getBestScore();
    if (stats.score > bestScore) {
      this.highScoreText.setText(`Best Score: ${this.formatNumber(stats.score)}`);
      this.highScoreText.setFill(VISUAL_SYSTEM.palette.accent.red);
    }
  }

  onLevelUp({ level } = {}) {
    if (level === undefined) return;

    this.levelText.setText(`Level: ${level}`);
    this.animateLevelUp(this.levelText);
  }

  animateTextUpdate(textObject) {
    this.scene.tweens.add({
      targets: textObject,
      scaleX: TEXT_UPDATE_SCALE,
      scaleY: TEXT_UPDATE_SCALE,
      duration: TEXT_UPDATE_DURATION,
      yoyo: true,
      ease: TEXT_ANIMATION_EASE
    });
  }

  animateLevelUp(textObject) {
    this.scene.tweens.add({
      targets: textObject,
      scaleX: LEVEL_UP_SCALE,
      scaleY: LEVEL_UP_SCALE,
      duration: LEVEL_UP_DURATION,
      yoyo: true,
      ease: TEXT_ANIMATION_EASE,
      onComplete: () =>
        this.scene.tweens.add({
          targets: textObject,
          alpha: LEVEL_UP_FLASH_ALPHA,
          duration: LEVEL_UP_FLASH_DURATION,
          yoyo: true
        })
    });
  }

  destroy() {
    EventBus.off(EVENTS.SCORE_UPDATED, this.onScoreUpdated, this);
    EventBus.off(EVENTS.LEVEL_UP, this.onLevelUp, this);
  }
}
