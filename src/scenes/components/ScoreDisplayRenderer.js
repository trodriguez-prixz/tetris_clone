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
import { t } from '../../i18n/index.js';

const CENTER_ORIGIN = 0.5;
const TEXT_UPDATE_SCALE = 1.15;
const TEXT_UPDATE_DURATION = 150;
const LEVEL_UP_SCALE = 1.18;
const LEVEL_UP_DURATION = 140;
const LEVEL_UP_FLASH_ALPHA = 0.55;
const LEVEL_UP_FLASH_DURATION = 80;
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

/** Offset of best-score text from Stats panel top (for clearance tests). */
export const SCORE_PANEL_HIGH_SCORE_OFFSET_Y = HIGH_SCORE_Y;

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

const DEFAULT_STATS = {
  score: 0,
  level: 1,
  lines: 0,
  pieces: 0,
  tetrises: 0
};

export default class ScoreDisplayRenderer {
  constructor(scene, gameState) {
    this.scene = scene;
    this.gameState = gameState;
    this.formatNumberCache = new Map();
    this.lastStats = { ...DEFAULT_STATS };
    this.lastTime = 0;

    this.createUI();

    EventBus.on(EVENTS.SCORE_UPDATED, this.onScoreUpdated, this);
    EventBus.on(EVENTS.LEVEL_UP, this.onLevelUp, this);
  }

  createUI() {
    const uiX = SIDEBAR_X + SIDEBAR_WIDTH / 2;
    const scoreAreaTop = SIDEBAR_Y + PREVIEW_AREA_HEIGHT + PADDING;

    this.titleText = this.createScoreText(
      uiX,
      scoreAreaTop,
      'title',
      t('stats.title')
    );
    this.currentLabelText = this.createScoreText(
      uiX,
      scoreAreaTop,
      'currentLabel',
      t('stats.currentRun')
    );
    this.scoreText = this.createScoreText(
      uiX,
      scoreAreaTop,
      'score',
      t('stats.score', { value: this.formatNumber(0) })
    );
    this.levelText = this.createScoreText(
      uiX,
      scoreAreaTop,
      'level',
      t('stats.level', { value: 1 })
    );
    this.linesText = this.createScoreText(
      uiX,
      scoreAreaTop,
      'lines',
      t('stats.lines', { value: this.formatNumber(0) })
    );

    this.sessionLabelText = this.createScoreText(
      uiX,
      scoreAreaTop,
      'sessionLabel',
      t('stats.session')
    );
    this.timeText = this.createScoreText(
      uiX,
      scoreAreaTop,
      'time',
      t('stats.elapsed', { value: '0:00' })
    );
    this.piecesText = this.createScoreText(
      uiX,
      scoreAreaTop,
      'pieces',
      t('stats.pieces', { value: 0 })
    );
    this.tetrisesText = this.createScoreText(
      uiX,
      scoreAreaTop,
      'tetrises',
      t('stats.tetrises', { value: 0 })
    );

    const bestScore = StorageManager.getBestScore();
    this.recordLabelText = this.createScoreText(
      uiX,
      scoreAreaTop,
      'recordLabel',
      t('stats.record')
    );
    this.highScoreText = this.createScoreText(
      uiX,
      scoreAreaTop,
      'highScore',
      t('stats.bestScore', { value: this.formatNumber(bestScore) })
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
    this.lastTime = time;
    this.timeText.setText(
      t('stats.elapsed', {
        value: this.gameState.score.formatTime(time)
      })
    );
  }

  onScoreUpdated({ stats } = {}) {
    if (!stats) return;

    this.lastStats = { ...this.lastStats, ...stats };

    const scoreLabel = t('stats.score', {
      value: this.formatNumber(stats.score)
    });
    if (this.scoreText.text !== scoreLabel) {
      this.scoreText.setText(scoreLabel);
      this.animateTextUpdate(this.scoreText);
    }
    this.linesText.setText(
      t('stats.lines', { value: this.formatNumber(stats.lines) })
    );
    this.piecesText.setText(t('stats.pieces', { value: stats.pieces }));
    this.tetrisesText.setText(t('stats.tetrises', { value: stats.tetrises }));

    const bestScore = StorageManager.getBestScore();
    if (stats.score > bestScore) {
      this.highScoreText.setText(
        t('stats.bestScore', { value: this.formatNumber(stats.score) })
      );
      this.highScoreText.setFill(VISUAL_SYSTEM.palette.accent.red);
    }
  }

  onLevelUp({ level } = {}) {
    if (level === undefined) return;

    this.lastStats = { ...this.lastStats, level };
    this.levelText.setText(t('stats.level', { value: level }));
    this.animateLevelUp(this.levelText);
  }

  refreshLocalizedLabels() {
    const stats = this.lastStats || { ...DEFAULT_STATS };
    const time = this.lastTime ?? 0;
    const bestScore = StorageManager.getBestScore();
    const displayBest = Math.max(bestScore, stats.score ?? 0);

    this.titleText.setText(t('stats.title'));
    this.currentLabelText.setText(t('stats.currentRun'));
    this.sessionLabelText.setText(t('stats.session'));
    this.recordLabelText.setText(t('stats.record'));
    this.scoreText.setText(
      t('stats.score', { value: this.formatNumber(stats.score ?? 0) })
    );
    this.levelText.setText(t('stats.level', { value: stats.level ?? 1 }));
    this.linesText.setText(
      t('stats.lines', { value: this.formatNumber(stats.lines ?? 0) })
    );
    this.piecesText.setText(t('stats.pieces', { value: stats.pieces ?? 0 }));
    this.tetrisesText.setText(
      t('stats.tetrises', { value: stats.tetrises ?? 0 })
    );
    this.timeText.setText(
      t('stats.elapsed', {
        value: this.gameState.score.formatTime(time)
      })
    );
    this.highScoreText.setText(
      t('stats.bestScore', { value: this.formatNumber(displayBest) })
    );
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
      ease: TEXT_ANIMATION_EASE
    });
    this.scene.tweens.add({
      targets: textObject,
      alpha: LEVEL_UP_FLASH_ALPHA,
      duration: LEVEL_UP_FLASH_DURATION,
      yoyo: true
    });
  }

  destroy() {
    EventBus.off(EVENTS.SCORE_UPDATED, this.onScoreUpdated, this);
    EventBus.off(EVENTS.LEVEL_UP, this.onLevelUp, this);
  }
}
