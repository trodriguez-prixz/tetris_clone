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

export default class UIRenderer {
  constructor(scene, gameState) {
    this.scene = scene;
    this.gameState = gameState;

    this.createBackgrounds();
    this.previewRenderer = new PreviewRenderer(scene, gameState);
    this.scoreDisplayRenderer = new ScoreDisplayRenderer(scene, gameState);
    this.audioIndicatorRenderer = new AudioIndicatorRenderer(scene);
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

  destroy() {
    this.previewRenderer.destroy();
    this.scoreDisplayRenderer.destroy();
  }
}
