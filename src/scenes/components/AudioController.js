import EventBus, { EVENTS } from '../../events/EventBus.js';
import { StorageManager } from '../../utils/storage.js';
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
    this.onPreferencesChanged = null;
  }

  setup(preferences = StorageManager.getPreferences()) {
    this.setupMusic();
    this.setupSoundEffects();
    this.applyPreferences(preferences);
    this.updateIndicators();

    EventBus.on(EVENTS.LINES_CLEARED, this.onLinesCleared, this);
    EventBus.on(EVENTS.LEVEL_UP, this.onLevelUp, this);
    EventBus.on(EVENTS.GAME_OVER, this.onGameOver, this);
  }

  applyPreferences(preferences) {
    this.musicMuted = Boolean(preferences?.musicMuted);
    if (this.soundEffects) {
      this.soundEffects.setEnabled(
        preferences?.soundEnabled !== undefined
          ? Boolean(preferences.soundEnabled)
          : true
      );
    }
    this.updateIndicators();
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

  persistAudioPreferences() {
    const preferences = StorageManager.getPreferences();
    preferences.musicMuted = this.musicMuted;
    preferences.soundEnabled = this.soundEffects
      ? this.soundEffects.isEnabled()
      : preferences.soundEnabled;
    StorageManager.savePreferences(preferences);
    this.onPreferencesChanged?.(preferences);
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
    this.persistAudioPreferences();
  }

  toggleSoundEffects() {
    if (!this.soundEffects) return;

    const enabled = this.soundEffects.toggle();
    this.updateIndicators(enabled);
    this.persistAudioPreferences();
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

  onLinesCleared({ rows } = {}) {
    if (!rows) return;

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
    const soundEnabled =
      soundEnabledOverride ??
      (this.soundEffects ? this.soundEffects.isEnabled() : false);
    this.uiRenderer.updateAudioIndicators(this.musicMuted, soundEnabled);
  }
}
