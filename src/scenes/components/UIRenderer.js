import {
  SIDEBAR_X,
  SIDEBAR_Y,
  SIDEBAR_WIDTH,
  PREVIEW_AREA_HEIGHT,
  SCORE_AREA_HEIGHT,
  PADDING,
  PANEL_BORDER_WIDTH,
  VISUAL_SYSTEM
} from '../../config/settings.js';
import AudioIndicatorRenderer from './AudioIndicatorRenderer.js';
import PreviewRenderer from './PreviewRenderer.js';
import ScoreDisplayRenderer from './ScoreDisplayRenderer.js';

const CENTER_ORIGIN = 0.5;
const GAMEPLAY_CONTROLS_START_Y =
  SIDEBAR_Y + PREVIEW_AREA_HEIGHT + PADDING + SCORE_AREA_HEIGHT + PADDING * 2;
const GAMEPLAY_CONTROLS_LINE_HEIGHT = 18;
const ACTION_FEEDBACK_OFFSET_FROM_BOTTOM = 125;
const ACTION_FEEDBACK_REPEAT_DELAY = 300;
const ACTION_FEEDBACK_VISIBLE_DELAY = 450;
const ACTION_FEEDBACK_FADE_DURATION = 250;

const GAMEPLAY_CONTROLS = [
  { text: 'Controls', emphasis: true },
  { text: '←/→ Move' },
  { text: '↑ Rotate' },
  { text: '↓ Soft drop' },
  { text: 'P/Space Pause' }
];

export default class UIRenderer {
  constructor(scene, gameState) {
    this.scene = scene;
    this.gameState = gameState;

    this.createBackgrounds();
    this.previewRenderer = new PreviewRenderer(scene, gameState);
    this.scoreDisplayRenderer = new ScoreDisplayRenderer(scene, gameState);
    this.audioIndicatorRenderer = new AudioIndicatorRenderer(scene);
    this.createGameplayControlsText();
    this.createActionFeedbackText();
  }

  createBackgrounds() {
    this.drawArea(
      SIDEBAR_X + SIDEBAR_WIDTH / 2,
      SIDEBAR_Y + PREVIEW_AREA_HEIGHT / 2,
      SIDEBAR_WIDTH - PADDING,
      PREVIEW_AREA_HEIGHT,
      VISUAL_SYSTEM.palette.surface.panel,
      VISUAL_SYSTEM.palette.border.primary
    );

    const scoreAreaY =
      SIDEBAR_Y + PREVIEW_AREA_HEIGHT + PADDING + SCORE_AREA_HEIGHT / 2;
    this.drawArea(
      SIDEBAR_X + SIDEBAR_WIDTH / 2,
      scoreAreaY,
      SIDEBAR_WIDTH - PADDING,
      SCORE_AREA_HEIGHT,
      VISUAL_SYSTEM.palette.surface.panel,
      VISUAL_SYSTEM.palette.border.primary
    );
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

  updateTime(time) {
    this.scoreDisplayRenderer.updateTime(time);
  }

  onScoreUpdated(payload) {
    this.scoreDisplayRenderer.onScoreUpdated(payload);
  }

  onLevelUp(payload) {
    this.scoreDisplayRenderer.onLevelUp(payload);
  }

  updateAudioIndicators(musicMuted, soundEnabled) {
    this.audioIndicatorRenderer.updateAudioIndicators(musicMuted, soundEnabled);
  }

  renderPreview() {
    this.previewRenderer.renderPreview();
  }

  createGameplayControlsText() {
    const controlsX = SIDEBAR_X + SIDEBAR_WIDTH / 2;

    this.gameplayControlTexts = GAMEPLAY_CONTROLS.map((control, index) =>
      this.scene.add
        .text(
          controlsX,
          GAMEPLAY_CONTROLS_START_Y + GAMEPLAY_CONTROLS_LINE_HEIGHT * index,
          control.text,
          {
            fontFamily: VISUAL_SYSTEM.typography.fontFamily,
            fontSize: control.emphasis
              ? VISUAL_SYSTEM.typography.size.body
              : VISUAL_SYSTEM.typography.size.caption,
            fill: control.emphasis
              ? VISUAL_SYSTEM.palette.text.primary
              : VISUAL_SYSTEM.palette.text.secondary,
            fontStyle: control.emphasis
              ? VISUAL_SYSTEM.typography.weight.emphasis
              : VISUAL_SYSTEM.typography.weight.regular
          }
        )
        .setOrigin(CENTER_ORIGIN)
    );
  }

  createActionFeedbackText() {
    this.actionFeedbackText = this.scene.add
      .text(
        SIDEBAR_X + SIDEBAR_WIDTH / 2,
        this.scene.scale?.height
          ? this.scene.scale.height - ACTION_FEEDBACK_OFFSET_FROM_BOTTOM
          : SIDEBAR_Y + PREVIEW_AREA_HEIGHT + SCORE_AREA_HEIGHT + PADDING * 4,
        '',
        {
          fontFamily: VISUAL_SYSTEM.typography.fontFamily,
          fontSize: VISUAL_SYSTEM.typography.size.caption,
          fill: VISUAL_SYSTEM.palette.accent.yellow,
          fontStyle: VISUAL_SYSTEM.typography.weight.emphasis
        }
      )
      .setOrigin(CENTER_ORIGIN)
      .setAlpha(0);
  }

  showUnavailableAction(message) {
    const now = this.scene.time.now;
    if (
      this.lastActionFeedbackAt !== undefined &&
      this.lastActionFeedbackMessage === message &&
      now - this.lastActionFeedbackAt < ACTION_FEEDBACK_REPEAT_DELAY
    ) {
      return;
    }

    this.lastActionFeedbackAt = now;
    this.lastActionFeedbackMessage = message;
    this.actionFeedbackText.setText(message).setAlpha(1);
    this.actionFeedbackTween?.stop();
    this.actionFeedbackTween = this.scene.tweens.add({
      targets: this.actionFeedbackText,
      alpha: 0,
      delay: ACTION_FEEDBACK_VISIBLE_DELAY,
      duration: ACTION_FEEDBACK_FADE_DURATION,
      ease: 'Power2'
    });
  }

  destroy() {
    this.previewRenderer.destroy();
    this.scoreDisplayRenderer.destroy();
    this.actionFeedbackTween?.stop();
    this.actionFeedbackText?.destroy();
    this.gameplayControlTexts?.forEach((controlText) => controlText.destroy());
  }
}
