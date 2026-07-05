import {
  SIDEBAR_X,
  SIDEBAR_WIDTH,
  CANVAS_HEIGHT,
  PADDING,
  VISUAL_SYSTEM
} from '../../config/settings.js';

const CENTER_ORIGIN = 0.5;

const AUDIO_TEXT_LAYOUT = {
  controls: {
    offsetFromBottom: 20,
    fontSize: VISUAL_SYSTEM.typography.size.caption
  },
  soundEffects: {
    offsetFromBottom: 50,
    fontSize: VISUAL_SYSTEM.typography.size.body
  },
  music: {
    offsetFromBottom: 75,
    fontSize: VISUAL_SYSTEM.typography.size.body
  }
};

const AUDIO_TEXT_STYLE = {
  controls: {
    fill: VISUAL_SYSTEM.palette.text.muted
  },
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

    this.scene.add
      .text(
        uiX,
        sidebarBottom - AUDIO_TEXT_LAYOUT.controls.offsetFromBottom,
        'M: Music | S: Sound',
        {
          fontFamily: VISUAL_SYSTEM.typography.fontFamily,
          fontSize: AUDIO_TEXT_LAYOUT.controls.fontSize,
          fill: AUDIO_TEXT_STYLE.controls.fill
        }
      )
      .setOrigin(CENTER_ORIGIN);
    this.soundEffectsIndicator = this.scene.add
      .text(
        uiX,
        sidebarBottom - AUDIO_TEXT_LAYOUT.soundEffects.offsetFromBottom,
        '🔊 Sound: ON',
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
        '🔊 Music: ON',
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
        musicMuted ? '🔇 Music: OFF' : '🔊 Music: ON'
      );
      this.musicIndicator.setFill(
        musicMuted
          ? VISUAL_SYSTEM.palette.accent.red
          : VISUAL_SYSTEM.palette.accent.green
      );
    }
    if (this.soundEffectsIndicator) {
      this.soundEffectsIndicator.setText(
        !soundEnabled ? '🔇 Sound: OFF' : '🔊 Sound: ON'
      );
      this.soundEffectsIndicator.setFill(
        !soundEnabled
          ? VISUAL_SYSTEM.palette.accent.red
          : VISUAL_SYSTEM.palette.accent.green
      );
    }
  }
}
