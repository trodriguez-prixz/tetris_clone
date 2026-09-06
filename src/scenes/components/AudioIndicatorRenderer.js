import {
  SIDEBAR_X,
  SIDEBAR_WIDTH,
  CANVAS_HEIGHT,
  PADDING,
  VISUAL_SYSTEM
} from '../../config/settings.js';
import { t } from '../../i18n/index.js';

const CENTER_ORIGIN = 0.5;

export const AUDIO_TEXT_LAYOUT = {
  soundEffects: {
    offsetFromBottom: 24,
    fontSize: VISUAL_SYSTEM.typography.size.body
  },
  music: {
    offsetFromBottom: 48,
    fontSize: VISUAL_SYSTEM.typography.size.body
  }
};

export const getAudioIndicatorYs = () => {
  const sidebarBottom = CANVAS_HEIGHT - PADDING;
  return {
    musicY: sidebarBottom - AUDIO_TEXT_LAYOUT.music.offsetFromBottom,
    soundY: sidebarBottom - AUDIO_TEXT_LAYOUT.soundEffects.offsetFromBottom
  };
};

const AUDIO_TEXT_STYLE = {
  indicator: {
    fill: VISUAL_SYSTEM.palette.text.secondary
  }
};

export default class AudioIndicatorRenderer {
  constructor(scene) {
    this.scene = scene;
    this.createUI();
  }

  createUI() {
    const uiX = SIDEBAR_X + SIDEBAR_WIDTH / 2;
    const sidebarBottom = CANVAS_HEIGHT - PADDING;

    this.soundEffectsIndicator = this.scene.add
      .text(
        uiX,
        sidebarBottom - AUDIO_TEXT_LAYOUT.soundEffects.offsetFromBottom,
        t('audio.soundOn'),
        {
          fontFamily: VISUAL_SYSTEM.typography.fontFamily,
          fontSize: AUDIO_TEXT_LAYOUT.soundEffects.fontSize,
          fill: AUDIO_TEXT_STYLE.indicator.fill
        }
      )
      .setOrigin(CENTER_ORIGIN);
    this.musicIndicator = this.scene.add
      .text(
        uiX,
        sidebarBottom - AUDIO_TEXT_LAYOUT.music.offsetFromBottom,
        t('audio.musicOn'),
        {
          fontFamily: VISUAL_SYSTEM.typography.fontFamily,
          fontSize: AUDIO_TEXT_LAYOUT.music.fontSize,
          fill: AUDIO_TEXT_STYLE.indicator.fill
        }
      )
      .setOrigin(CENTER_ORIGIN);
  }

  updateAudioIndicators(musicMuted, soundEnabled) {
    if (this.musicIndicator) {
      this.musicIndicator.setText(
        musicMuted ? t('audio.musicOff') : t('audio.musicOn')
      );
      this.musicIndicator.setFill(
        musicMuted
          ? VISUAL_SYSTEM.palette.accent.red
          : VISUAL_SYSTEM.palette.accent.green
      );
    }
    if (this.soundEffectsIndicator) {
      this.soundEffectsIndicator.setText(
        !soundEnabled ? t('audio.soundOff') : t('audio.soundOn')
      );
      this.soundEffectsIndicator.setFill(
        !soundEnabled
          ? VISUAL_SYSTEM.palette.accent.red
          : VISUAL_SYSTEM.palette.accent.green
      );
    }
  }
}
