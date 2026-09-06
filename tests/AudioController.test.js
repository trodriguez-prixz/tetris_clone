import AudioController from '../src/scenes/components/AudioController.js';
import { StorageManager } from '../src/utils/storage.js';

jest.mock('../src/utils/retroMusic.js', () => ({
  RetroMusic: jest.fn().mockImplementation(() => ({
    init: jest.fn(() => true),
    play: jest.fn(),
    pause: jest.fn(),
    resume: jest.fn(),
    stop: jest.fn()
  }))
}));

jest.mock('../src/utils/soundEffects.js', () => ({
  SoundEffects: jest.fn().mockImplementation(() => ({
    init: jest.fn(() => true),
    toggle: jest.fn(function toggle() {
      this.enabled = !this.enabled;
      return this.enabled;
    }),
    setEnabled: jest.fn(function setEnabled(enabled) {
      this.enabled = enabled;
    }),
    isEnabled: jest.fn(function isEnabled() {
      return this.enabled !== false;
    }),
    playMove: jest.fn(),
    playRotate: jest.fn(),
    playLineClear: jest.fn(),
    playLevelUp: jest.fn(),
    playGameOver: jest.fn(),
    enabled: true
  }))
}));

describe('AudioController preferences', () => {
  let uiRenderer;

  beforeEach(() => {
    localStorage.clear();
    uiRenderer = { updateAudioIndicators: jest.fn() };
  });

  test('loads muted music preference on setup', () => {
    StorageManager.savePreferences({
      ghostEnabled: true,
      musicMuted: true,
      soundEnabled: false
    });

    const controller = new AudioController({}, uiRenderer);
    controller.setup(StorageManager.getPreferences());

    expect(controller.musicMuted).toBe(true);
    expect(controller.soundEffects.setEnabled).toHaveBeenCalledWith(false);
    expect(uiRenderer.updateAudioIndicators).toHaveBeenCalledWith(true, false);
  });

  test('persists music toggle into preferences', () => {
    const controller = new AudioController({}, uiRenderer);
    controller.setup();

    controller.toggleMusic(false);

    expect(StorageManager.getPreferences().musicMuted).toBe(true);
  });
});
