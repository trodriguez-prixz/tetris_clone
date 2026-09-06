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
  score: {
    offsetY: -VISUAL_SYSTEM.spacing.sm,
    fontSize: VISUAL_SYSTEM.typography.size.overlayPrompt
  },
  outcome: {
    offsetY: VISUAL_SYSTEM.spacing.lg,
    fontSize: VISUAL_SYSTEM.typography.size.overlayPrompt
  },
  action: {
    offsetY: VISUAL_SYSTEM.spacing.xl + VISUAL_SYSTEM.spacing.lg,
    fontSize: VISUAL_SYSTEM.typography.size.metric
  },
  settingsHint: {
    offsetY: VISUAL_SYSTEM.spacing.xl * 2 + VISUAL_SYSTEM.spacing.md,
    fontSize: VISUAL_SYSTEM.typography.size.caption
  },
  preferenceStart: {
    offsetY: VISUAL_SYSTEM.spacing.xl,
    fontSize: VISUAL_SYSTEM.typography.size.caption,
    lineHeight: VISUAL_SYSTEM.spacing.md
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
  score: {
    fill: VISUAL_SYSTEM.palette.text.primary,
    fontStyle: VISUAL_SYSTEM.typography.weight.emphasis
  },
  outcome: {
    fill: VISUAL_SYSTEM.palette.text.primary,
    fontStyle: VISUAL_SYSTEM.typography.weight.emphasis
  },
  action: {
    fill: VISUAL_SYSTEM.palette.accent.cyan,
    fontStyle: VISUAL_SYSTEM.typography.weight.regular
  },
  hint: {
    fill: VISUAL_SYSTEM.palette.text.secondary,
    fontStyle: VISUAL_SYSTEM.typography.weight.regular
  },
  preference: {
    fill: VISUAL_SYSTEM.palette.text.secondary,
    fontStyle: VISUAL_SYSTEM.typography.weight.regular
  }
};

const OVERLAY_CONTENT = {
  start: {
    alpha: START_OVERLAY_ALPHA,
    title: 'TETRIS',
    status: 'Start screen',
    action: 'Press any key except P, or click',
    settingsHint: 'Esc Settings',
    flashAction: true
  },
  pause: {
    alpha: MODAL_OVERLAY_ALPHA,
    title: 'PAUSED',
    status: 'Play is paused',
    action: 'Press P or Space to resume'
  },
  settings: {
    alpha: MODAL_OVERLAY_ALPHA,
    title: 'SETTINGS',
    status: 'Presentation preferences',
    action: 'Esc to close'
  },
  gameOver: {
    alpha: MODAL_OVERLAY_ALPHA,
    title: 'GAME OVER',
    action: 'Press R or click to restart'
  }
};

const preferenceLines = (preferences = {}) => {
  const ghostOn = preferences.ghostEnabled !== false;
  const musicOn = !preferences.musicMuted;
  const soundOn = preferences.soundEnabled !== false;
  return [
    `G Ghost: ${ghostOn ? 'ON' : 'OFF'}`,
    `M Music: ${musicOn ? 'ON' : 'OFF'}`,
    `S Sound: ${soundOn ? 'ON' : 'OFF'}`
  ];
};

export default class OverlayRenderer {
  constructor(scene) {
    this.scene = scene;
    this.startElements = null;
    this.pauseElements = null;
    this.settingsElements = null;
    this.gameOverElements = null;
  }

  renderStartScreen() {
    this.clearStartScreen();

    const content = OVERLAY_CONTENT.start;
    const elements = this.renderOverlay(content);
    const hint = this.createCenteredText(
      OVERLAY_LAYOUT.settingsHint,
      content.settingsHint,
      OVERLAY_TEXT_STYLE.hint
    );
    this.startElements = [...elements, hint];
  }

  clearStartScreen() {
    this.startElements = this.destroyElements(this.startElements);
  }

  renderPauseScreen(preferences = {}) {
    this.clearPauseScreen();

    const content = OVERLAY_CONTENT.pause;
    const base = this.renderOverlay(content);
    const prefs = this.createPreferenceTexts(preferences, 0);
    this.pauseElements = [...base, ...prefs];
  }

  clearPauseScreen() {
    this.pauseElements = this.destroyElements(this.pauseElements);
  }

  renderSettingsScreen(preferences = {}) {
    this.clearSettingsScreen();

    const content = OVERLAY_CONTENT.settings;
    const base = this.renderOverlay(content);
    const prefs = this.createPreferenceTexts(
      preferences,
      VISUAL_SYSTEM.spacing.sm
    );
    this.settingsElements = [...base, ...prefs];
  }

  clearSettingsScreen() {
    this.settingsElements = this.destroyElements(this.settingsElements);
  }

  renderGameOverScreen(summary) {
    this.clearGameOverScreen();

    const content = OVERLAY_CONTENT.gameOver;
    const overlay = this.createOverlay(content.alpha);
    const title = this.createCenteredText(
      OVERLAY_LAYOUT.title,
      content.title,
      OVERLAY_TEXT_STYLE.title
    );
    const score = this.createCenteredText(
      OVERLAY_LAYOUT.score,
      `Score: ${summary.score}`,
      OVERLAY_TEXT_STYLE.score
    );
    const outcome = this.createCenteredText(
      OVERLAY_LAYOUT.outcome,
      summary.outcomeLabel,
      OVERLAY_TEXT_STYLE.outcome
    );
    const action = this.createCenteredText(
      OVERLAY_LAYOUT.action,
      content.action,
      OVERLAY_TEXT_STYLE.action
    );

    this.gameOverElements = [overlay, title, score, outcome, action];
  }

  clearGameOverScreen() {
    this.gameOverElements = this.destroyElements(this.gameOverElements);
  }

  createPreferenceTexts(preferences, extraOffsetY = 0) {
    return preferenceLines(preferences).map((line, index) =>
      this.createCenteredText(
        {
          ...OVERLAY_LAYOUT.preferenceStart,
          offsetY:
            OVERLAY_LAYOUT.preferenceStart.offsetY +
            extraOffsetY +
            OVERLAY_LAYOUT.preferenceStart.lineHeight * index
        },
        line,
        OVERLAY_TEXT_STYLE.preference
      )
    );
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
