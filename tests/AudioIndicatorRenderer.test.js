import AudioIndicatorRenderer from '../src/scenes/components/AudioIndicatorRenderer.js';
import { VISUAL_SYSTEM } from '../src/config/settings.js';
import { setLocale } from '../src/i18n/index.js';

const createTextObject = () => ({
  setOrigin: jest.fn().mockReturnThis(),
  setText: jest.fn().mockReturnThis(),
  setFill: jest.fn().mockReturnThis()
});

const buildScene = () => ({
  add: {
    text: jest.fn(() => createTextObject())
  }
});

describe('AudioIndicatorRenderer', () => {
  let scene;
  let renderer;

  beforeEach(() => {
    setLocale('en');
    scene = buildScene();
    renderer = new AudioIndicatorRenderer(scene);
  });

  afterEach(() => {
    setLocale('en');
  });

  test('shows audio status indicators without duplicating Controls shortcuts', () => {
    const createdLabels = scene.add.text.mock.calls.map((call) => call[2]);

    expect(createdLabels).not.toContain('M: Music | S: Sound');
    expect(createdLabels.some((label) => /^M:/.test(label))).toBe(false);
    expect(createdLabels.some((label) => /^S:/.test(label))).toBe(false);

    expect(scene.add.text).toHaveBeenCalledWith(
      expect.any(Number),
      expect.any(Number),
      '🔊 Sound: ON',
      expect.objectContaining({
        fontFamily: VISUAL_SYSTEM.typography.fontFamily,
        fill: VISUAL_SYSTEM.palette.text.secondary
      })
    );
    expect(scene.add.text).toHaveBeenCalledWith(
      expect.any(Number),
      expect.any(Number),
      '🔊 Music: ON',
      expect.objectContaining({
        fontFamily: VISUAL_SYSTEM.typography.fontFamily,
        fill: VISUAL_SYSTEM.palette.text.secondary
      })
    );
  });

  test('updates labels and colors when audio toggles change state', () => {
    renderer.updateAudioIndicators(true, false);

    expect(renderer.musicIndicator.setText).toHaveBeenCalledWith(
      '🔇 Music: OFF'
    );
    expect(renderer.musicIndicator.setFill).toHaveBeenCalledWith(
      VISUAL_SYSTEM.palette.accent.red
    );
    expect(renderer.soundEffectsIndicator.setText).toHaveBeenCalledWith(
      '🔇 Sound: OFF'
    );
    expect(renderer.soundEffectsIndicator.setFill).toHaveBeenCalledWith(
      VISUAL_SYSTEM.palette.accent.red
    );

    renderer.updateAudioIndicators(false, true);

    expect(renderer.musicIndicator.setText).toHaveBeenCalledWith(
      '🔊 Music: ON'
    );
    expect(renderer.musicIndicator.setFill).toHaveBeenCalledWith(
      VISUAL_SYSTEM.palette.accent.green
    );
    expect(renderer.soundEffectsIndicator.setText).toHaveBeenCalledWith(
      '🔊 Sound: ON'
    );
    expect(renderer.soundEffectsIndicator.setFill).toHaveBeenCalledWith(
      VISUAL_SYSTEM.palette.accent.green
    );
  });
});
