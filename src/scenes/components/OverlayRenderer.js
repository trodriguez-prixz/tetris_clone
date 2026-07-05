import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  VISUAL_SYSTEM
} from '../../config/settings.js';

const CENTER_ORIGIN = 0.5;
const START_OVERLAY_ALPHA = 0.82;
const MODAL_OVERLAY_ALPHA = 0.78;
const START_ACTION_FLASH_ALPHA = 0.35;
const START_PROMPT_FLASH_DURATION = 800;
const REPEAT_FOREVER = -1;

const OVERLAY_LAYOUT = {
  title: {
    offsetY: -VISUAL_SYSTEM.spacing.xl * 2,
    fontSize: VISUAL_SYSTEM.typography.size.overlayTitle
  },
  status: {
    offsetY: VISUAL_SYSTEM.spacing.md,
    fontSize: VISUAL_SYSTEM.typography.size.overlayPrompt
  },
  action: {
    offsetY: VISUAL_SYSTEM.spacing.xl + VISUAL_SYSTEM.spacing.lg,
    fontSize: VISUAL_SYSTEM.typography.size.metric
  }
};

const OVERLAY_TEXT_STYLE = {
  title: {
    fill: VISUAL_SYSTEM.palette.accent.magenta,
    fontStyle: VISUAL_SYSTEM.typography.weight.emphasis
  },
  status: {
    fill: VISUAL_SYSTEM.palette.text.primary,
    fontStyle: VISUAL_SYSTEM.typography.weight.emphasis
  },
  action: {
    fill: VISUAL_SYSTEM.palette.accent.cyan,
    fontStyle: VISUAL_SYSTEM.typography.weight.regular
  }
};

const OVERLAY_CONTENT = {
  start: {
    alpha: START_OVERLAY_ALPHA,
    title: 'TETRIS',
    status: 'Ready to play',
    action: 'Press any key except P, or click to start',
    flashAction: true
  },
  pause: {
    alpha: MODAL_OVERLAY_ALPHA,
    title: 'PAUSED',
    status: 'Game is paused',
    action: 'Press P or Space to resume'
  },
  gameOver: {
    alpha: MODAL_OVERLAY_ALPHA,
    title: 'GAME OVER',
    status: 'Run finished',
    action: 'Press R to restart'
  }
};

export default class OverlayRenderer {
  constructor(scene) {
    this.scene = scene;
    this.startElements = null;
    this.pauseElements = null;
    this.gameOverElements = null;
  }

  renderStartScreen() {
    this.clearStartScreen();

    this.startElements = this.renderOverlay(OVERLAY_CONTENT.start);
  }

  clearStartScreen() {
    this.startElements = this.destroyElements(this.startElements);
  }

  renderPauseScreen() {
    this.clearPauseScreen();

    this.pauseElements = this.renderOverlay(OVERLAY_CONTENT.pause);
  }

  clearPauseScreen() {
    this.pauseElements = this.destroyElements(this.pauseElements);
  }

  renderGameOverScreen() {
    this.clearGameOverScreen();

    this.gameOverElements = this.renderOverlay(OVERLAY_CONTENT.gameOver);
  }

  clearGameOverScreen() {
    this.gameOverElements = this.destroyElements(this.gameOverElements);
  }

  renderOverlay(content) {
    const overlay = this.createOverlay(content.alpha);
    const title = this.createCenteredText(
      OVERLAY_LAYOUT.title,
      content.title,
      OVERLAY_TEXT_STYLE.title
    );
    const status = this.createCenteredText(
      OVERLAY_LAYOUT.status,
      content.status,
      OVERLAY_TEXT_STYLE.status
    );
    const action = this.createCenteredText(
      OVERLAY_LAYOUT.action,
      content.action,
      OVERLAY_TEXT_STYLE.action
    );

    if (content.flashAction) {
      this.scene.tweens.add({
        targets: action,
        alpha: START_ACTION_FLASH_ALPHA,
        duration: START_PROMPT_FLASH_DURATION,
        yoyo: true,
        repeat: REPEAT_FOREVER
      });
    }

    return [overlay, title, status, action];
  }

  createOverlay(alpha) {
    return this.scene.add.rectangle(
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2,
      CANVAS_WIDTH,
      CANVAS_HEIGHT,
      VISUAL_SYSTEM.palette.surface.overlay,
      alpha
    );
  }

  createCenteredText(layout, text, textStyle) {
    const style = {
      fontFamily: VISUAL_SYSTEM.typography.fontFamily,
      fontSize: layout.fontSize,
      fill: textStyle.fill,
      fontStyle: textStyle.fontStyle,
      align: 'center'
    };

    return this.scene.add
      .text(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + layout.offsetY, text, style)
      .setOrigin(CENTER_ORIGIN);
  }

  destroyElements(elements) {
    if (elements) elements.forEach((element) => element.destroy());
    return null;
  }
}
