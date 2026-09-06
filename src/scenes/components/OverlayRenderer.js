import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  VISUAL_SYSTEM
} from '../../config/settings.js';
import { t, getLocale } from '../../i18n/index.js';

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
    // Below status (md); line step matches spacing.lg so rows stay readable.
    offsetY: VISUAL_SYSTEM.spacing.md + VISUAL_SYSTEM.spacing.lg,
    fontSize: VISUAL_SYSTEM.typography.size.caption,
    lineHeight: VISUAL_SYSTEM.spacing.lg
  },
  preferenceActionGap: VISUAL_SYSTEM.spacing.md
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

const overlayContent = () => ({
  start: {
    alpha: START_OVERLAY_ALPHA,
    title: t('overlay.start.title'),
    status: t('overlay.start.status'),
    action: t('overlay.start.action'),
    settingsHint: t('overlay.start.settingsHint'),
    flashAction: true
  },
  pause: {
    alpha: MODAL_OVERLAY_ALPHA,
    title: t('overlay.pause.title'),
    status: t('overlay.pause.status'),
    action: t('overlay.pause.action')
  },
  settings: {
    alpha: MODAL_OVERLAY_ALPHA,
    title: t('overlay.settings.title'),
    status: t('overlay.settings.status'),
    action: t('overlay.settings.action')
  },
  gameOver: {
    alpha: MODAL_OVERLAY_ALPHA,
    title: t('overlay.gameOver.title'),
    action: t('overlay.gameOver.action')
  }
});

const preferenceLines = (preferences = {}) => {
  const ghostOn = preferences.ghostEnabled !== false;
  const musicOn = !preferences.musicMuted;
  const soundOn = preferences.soundEnabled !== false;
  const locale = preferences.locale || getLocale();
  const on = t('pref.on');
  const off = t('pref.off');
  return [
    t('pref.ghost', { state: ghostOn ? on : off }),
    t('pref.music', { state: musicOn ? on : off }),
    t('pref.sound', { state: soundOn ? on : off }),
    t('pref.language', {
      language: t(locale === 'es' ? 'pref.lang.es' : 'pref.lang.en')
    })
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

    const content = overlayContent().start;
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
    this.pauseElements = this.renderPreferenceOverlay(
      overlayContent().pause,
      preferences
    );
  }

  clearPauseScreen() {
    this.pauseElements = this.destroyElements(this.pauseElements);
  }

  renderSettingsScreen(preferences = {}) {
    this.clearSettingsScreen();
    this.settingsElements = this.renderPreferenceOverlay(
      overlayContent().settings,
      preferences
    );
  }

  clearSettingsScreen() {
    this.settingsElements = this.destroyElements(this.settingsElements);
  }

  renderGameOverScreen(summary) {
    this.clearGameOverScreen();

    const content = overlayContent().gameOver;
    const overlay = this.createOverlay(content.alpha);
    const title = this.createCenteredText(
      OVERLAY_LAYOUT.title,
      content.title,
      OVERLAY_TEXT_STYLE.title
    );
    const score = this.createCenteredText(
      OVERLAY_LAYOUT.score,
      t('overlay.gameOver.score', { score: summary.score }),
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

  renderPreferenceOverlay(content, preferences = {}) {
    const lines = preferenceLines(preferences);
    const prefs = this.createPreferenceTexts(lines);
    const actionOffsetY =
      OVERLAY_LAYOUT.preferenceStart.offsetY +
      OVERLAY_LAYOUT.preferenceStart.lineHeight *
        Math.max(lines.length - 1, 0) +
      OVERLAY_LAYOUT.preferenceActionGap +
      OVERLAY_LAYOUT.preferenceStart.lineHeight;

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
      {
        ...OVERLAY_LAYOUT.action,
        offsetY: actionOffsetY
      },
      content.action,
      OVERLAY_TEXT_STYLE.action
    );

    return [overlay, title, status, ...prefs, action];
  }

  createPreferenceTexts(lines) {
    return lines.map((line, index) =>
      this.createCenteredText(
        {
          ...OVERLAY_LAYOUT.preferenceStart,
          offsetY:
            OVERLAY_LAYOUT.preferenceStart.offsetY +
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
