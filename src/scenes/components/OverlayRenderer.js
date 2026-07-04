import { CANVAS_WIDTH, CANVAS_HEIGHT, COLORS } from '../../config/settings.js';

const CENTER_ORIGIN = 0.5;
const START_OVERLAY_ALPHA = 0.8;
const MODAL_OVERLAY_ALPHA = 0.7;
const START_PROMPT_FLASH_ALPHA = 0.3;
const START_PROMPT_FLASH_DURATION = 800;
const REPEAT_FOREVER = -1;

const OVERLAY_TEXT_LAYOUT = {
  startTitle: { offsetY: -200, fontSize: '64px' },
  startPrompt: { offsetY: 100, fontSize: '24px' },
  pauseTitle: { offsetY: 0, fontSize: '64px' },
  gameOverTitle: { offsetY: -60, fontSize: '48px' },
  restartPrompt: { offsetY: 60, fontSize: '20px' }
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

    const overlay = this.createOverlay(START_OVERLAY_ALPHA);
    const titleText = this.createCenteredText(
      OVERLAY_TEXT_LAYOUT.startTitle,
      'TETRIS',
      COLORS.DANGER,
      'bold'
    );
    const startText = this.createCenteredText(
      OVERLAY_TEXT_LAYOUT.startPrompt,
      'Presiona cualquier tecla',
      COLORS.SUCCESS,
      'bold'
    );
    this.scene.tweens.add({
      targets: startText,
      alpha: START_PROMPT_FLASH_ALPHA,
      duration: START_PROMPT_FLASH_DURATION,
      yoyo: true,
      repeat: REPEAT_FOREVER
    });

    this.startElements = [overlay, titleText, startText];
  }

  clearStartScreen() {
    this.startElements = this.destroyElements(this.startElements);
  }

  renderPauseScreen() {
    this.clearPauseScreen();

    const overlay = this.createOverlay(MODAL_OVERLAY_ALPHA);
    const text = this.createCenteredText(
      OVERLAY_TEXT_LAYOUT.pauseTitle,
      'PAUSED',
      COLORS.WARNING,
      'bold'
    );

    this.pauseElements = [overlay, text];
  }

  clearPauseScreen() {
    this.pauseElements = this.destroyElements(this.pauseElements);
  }

  renderGameOverScreen() {
    this.clearGameOverScreen();

    const overlay = this.createOverlay(MODAL_OVERLAY_ALPHA);
    const text = this.createCenteredText(
      OVERLAY_TEXT_LAYOUT.gameOverTitle,
      'GAME OVER',
      COLORS.DANGER,
      'bold'
    );
    const restartText = this.createCenteredText(
      OVERLAY_TEXT_LAYOUT.restartPrompt,
      'Press R to Restart',
      COLORS.SECONDARY_TEXT
    );

    this.gameOverElements = [overlay, text, restartText];
  }

  clearGameOverScreen() {
    this.gameOverElements = this.destroyElements(this.gameOverElements);
  }

  createOverlay(alpha) {
    return this.scene.add.rectangle(
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2,
      CANVAS_WIDTH,
      CANVAS_HEIGHT,
      COLORS.OVERLAY,
      alpha
    );
  }

  createCenteredText(layout, text, fill, fontStyle) {
    const style = { fontSize: layout.fontSize, fill };
    if (fontStyle) style.fontStyle = fontStyle;

    return this.scene.add
      .text(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + layout.offsetY, text, style)
      .setOrigin(CENTER_ORIGIN);
  }

  destroyElements(elements) {
    if (elements) elements.forEach((element) => element.destroy());
    return null;
  }
}
