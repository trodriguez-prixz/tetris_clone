import EventBus, { EVENTS } from '../../events/EventBus.js';
import { RetroMusic } from '../../utils/retroMusic.js';
import { SoundEffects } from '../../utils/soundEffects.js';

export default class AudioController {
  constructor(scene, uiRenderer) {
    this.scene = scene;
    this.uiRenderer = uiRenderer;
    this.musicMuted = false;
    this.musicStarted = false;
    this.retroMusic = null;
    this.soundEffects = null;
  }

  setup() {
    this.setupMusic();
    this.setupSoundEffects();
    this.updateIndicators();

    EventBus.on(EVENTS.LINES_CLEARED, this.onLinesCleared, this);
    EventBus.on(EVENTS.LEVEL_UP, this.onLevelUp, this);
    EventBus.on(EVENTS.GAME_OVER, this.onGameOver, this);
  }

  setupMusic() {
    try {
      this.retroMusic = new RetroMusic(this.scene);
      if (!this.retroMusic.init()) this.retroMusic = null;
    } catch (e) {
      this.retroMusic = null;
    }
  }

  setupSoundEffects() {
    try {
      this.soundEffects = new SoundEffects(this.scene);
      if (!this.soundEffects.init()) this.soundEffects = null;
    } catch (e) {
      this.soundEffects = null;
    }
  }

  toggleMusic(isPlaying) {
    this.musicMuted = !this.musicMuted;

    if (this.retroMusic) {
      if (this.musicMuted) {
        this.stopMusic();
      } else if (isPlaying) {
        this.startMusic();
      }
    }

    this.updateIndicators();
  }

  toggleSoundEffects() {
    if (!this.soundEffects) return;

    const enabled = this.soundEffects.toggle();
    this.updateIndicators(enabled);
    if (enabled) this.playMove();
  }

  startMusic() {
    if (this.retroMusic && !this.musicMuted && !this.musicStarted) {
      this.retroMusic.play();
      this.musicStarted = true;
    }
  }

  pauseMusic() {
    if (this.retroMusic) this.retroMusic.pause();
  }

  resumeMusic() {
    if (this.retroMusic) this.retroMusic.resume();
  }

  stopMusic() {
    if (this.retroMusic) this.retroMusic.stop();
    this.musicStarted = false;
  }

  playMove() {
    if (this.soundEffects) this.soundEffects.playMove();
  }

  playRotate() {
    if (this.soundEffects) this.soundEffects.playRotate();
  }

  onLinesCleared(rows) {
    if (this.soundEffects) this.soundEffects.playLineClear(rows.length);
  }

  onLevelUp() {
    if (this.soundEffects) this.soundEffects.playLevelUp();
  }

  onGameOver() {
    if (this.soundEffects) this.soundEffects.playGameOver();
    this.stopMusic();
  }

  updateIndicators(soundEnabledOverride) {
    const soundEnabled = soundEnabledOverride ?? (this.soundEffects ? this.soundEffects.isEnabled() : false);
    this.uiRenderer.updateAudioIndicators(this.musicMuted, soundEnabled);
  }
}
