import OverlayRenderer from '../src/scenes/components/OverlayRenderer.js';
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  VISUAL_SYSTEM
} from '../src/config/settings.js';

const createDisplayObject = () => ({
  setOrigin: jest.fn().mockReturnThis(),
  destroy: jest.fn()
});

const buildScene = () => ({
  add: {
    rectangle: jest.fn(() => createDisplayObject()),
    text: jest.fn(() => createDisplayObject())
  },
  tweens: {
    add: jest.fn()
  }
});

describe('OverlayRenderer', () => {
  let scene;
  let renderer;

  beforeEach(() => {
    scene = buildScene();
    renderer = new OverlayRenderer(scene);
  });

  test('renders standardized start overlay with current state and valid start action', () => {
    renderer.renderStartScreen();

    expect(scene.add.rectangle).toHaveBeenCalledWith(
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2,
      CANVAS_WIDTH,
      CANVAS_HEIGHT,
      VISUAL_SYSTEM.palette.surface.overlay,
      expect.any(Number)
    );
    expect(scene.add.text).toHaveBeenCalledWith(
      CANVAS_WIDTH / 2,
      expect.any(Number),
      'TETRIS',
      expect.objectContaining({
        fontFamily: VISUAL_SYSTEM.typography.fontFamily,
        fontSize: VISUAL_SYSTEM.typography.size.overlayTitle,
        fill: VISUAL_SYSTEM.palette.accent.magenta,
        fontStyle: VISUAL_SYSTEM.typography.weight.emphasis,
        align: 'center'
      })
    );
    expect(scene.add.text).toHaveBeenCalledWith(
      CANVAS_WIDTH / 2,
      expect.any(Number),
      'Start screen',
      expect.objectContaining({
        fontSize: VISUAL_SYSTEM.typography.size.overlayPrompt,
        fill: VISUAL_SYSTEM.palette.text.primary
      })
    );
    expect(scene.add.text).toHaveBeenCalledWith(
      CANVAS_WIDTH / 2,
      expect.any(Number),
      'Press any key except P, or click',
      expect.objectContaining({
        fontSize: VISUAL_SYSTEM.typography.size.metric,
        fill: VISUAL_SYSTEM.palette.accent.cyan
      })
    );
    expect(scene.add.text).toHaveBeenCalledWith(
      CANVAS_WIDTH / 2,
      expect.any(Number),
      'Esc Settings',
      expect.objectContaining({
        fontSize: VISUAL_SYSTEM.typography.size.caption
      })
    );
    expect(scene.tweens.add).toHaveBeenCalledWith(
      expect.objectContaining({
        targets: scene.add.text.mock.results[2].value,
        yoyo: true
      })
    );
  });

  const preferenceLineStep = VISUAL_SYSTEM.spacing.lg;
  const textYByLabel = (label) => {
    const call = scene.add.text.mock.calls.find((entry) => entry[2] === label);
    expect(call).toBeDefined();
    return call[1];
  };

  test('renders pause preference lines from current preferences', () => {
    renderer.renderPauseScreen({
      ghostEnabled: false,
      musicMuted: true,
      soundEnabled: true
    });

    const labels = scene.add.text.mock.calls.map((call) => call[2]);
    expect(labels).toContain('PAUSED');
    expect(labels).toContain('G Ghost: OFF');
    expect(labels).toContain('M Music: OFF');
    expect(labels).toContain('S Sound: ON');
  });

  test('stacks pause preference lines below status and above resume without Y collision', () => {
    renderer.renderPauseScreen({
      ghostEnabled: false,
      musicMuted: true,
      soundEnabled: true
    });

    const statusY = textYByLabel('Play is paused');
    const ghostY = textYByLabel('G Ghost: OFF');
    const musicY = textYByLabel('M Music: OFF');
    const soundY = textYByLabel('S Sound: ON');
    const resumeY = textYByLabel('Press P or Space to resume');

    expect(ghostY - statusY).toBeGreaterThanOrEqual(preferenceLineStep);
    expect(musicY - ghostY).toBeGreaterThanOrEqual(preferenceLineStep);
    expect(soundY - musicY).toBeGreaterThanOrEqual(preferenceLineStep);
    expect(resumeY - soundY).toBeGreaterThanOrEqual(preferenceLineStep);
  });

  test('renders settings panel preference lines', () => {
    renderer.renderSettingsScreen({
      ghostEnabled: true,
      musicMuted: false,
      soundEnabled: false
    });

    const labels = scene.add.text.mock.calls.map((call) => call[2]);
    expect(labels).toContain('SETTINGS');
    expect(labels).toContain('Esc to close');
    expect(labels).toContain('G Ghost: ON');
    expect(labels).toContain('M Music: ON');
    expect(labels).toContain('S Sound: OFF');
  });

  test('stacks settings preference lines above close action without Y collision', () => {
    renderer.renderSettingsScreen({
      ghostEnabled: true,
      musicMuted: false,
      soundEnabled: false
    });

    const statusY = textYByLabel('Presentation preferences');
    const ghostY = textYByLabel('G Ghost: ON');
    const musicY = textYByLabel('M Music: ON');
    const soundY = textYByLabel('S Sound: OFF');
    const closeY = textYByLabel('Esc to close');

    expect(ghostY - statusY).toBeGreaterThanOrEqual(preferenceLineStep);
    expect(musicY - ghostY).toBeGreaterThanOrEqual(preferenceLineStep);
    expect(soundY - musicY).toBeGreaterThanOrEqual(preferenceLineStep);
    expect(closeY - soundY).toBeGreaterThanOrEqual(preferenceLineStep);
  });

  test('renders standardized pause presentation content', () => {
    renderer.renderPauseScreen();

    expect(scene.add.text).toHaveBeenCalledWith(
      CANVAS_WIDTH / 2,
      expect.any(Number),
      'PAUSED',
      expect.objectContaining({
        fontSize: VISUAL_SYSTEM.typography.size.overlayTitle,
        fill: VISUAL_SYSTEM.palette.accent.magenta
      })
    );
    expect(scene.add.text).toHaveBeenCalledWith(
      CANVAS_WIDTH / 2,
      expect.any(Number),
      'Play is paused',
      expect.objectContaining({
        fontSize: VISUAL_SYSTEM.typography.size.overlayPrompt,
        fill: VISUAL_SYSTEM.palette.text.primary
      })
    );
    expect(scene.add.text).toHaveBeenCalledWith(
      CANVAS_WIDTH / 2,
      expect.any(Number),
      'Press P or Space to resume',
      expect.objectContaining({
        fontSize: VISUAL_SYSTEM.typography.size.metric,
        fill: VISUAL_SYSTEM.palette.accent.cyan
      })
    );
    expect(scene.tweens.add).not.toHaveBeenCalled();
  });

  test('renders game-over summary with final score and new-best outcome', () => {
    renderer.renderGameOverScreen({ score: 2500, outcomeLabel: 'New best' });

    const textCalls = scene.add.text.mock.calls.map((call) => call[2]);

    expect(textCalls).toContain('GAME OVER');
    expect(textCalls).toContain('Score: 2500');
    expect(textCalls).toContain('New best');
    expect(
      textCalls.some((text) => /R/i.test(text) && /click/i.test(text))
    ).toBe(true);
    expect(textCalls).not.toContain('Run ended');
    expect(textCalls.every((text) => !/\blines\b/i.test(text))).toBe(true);
    expect(textCalls.every((text) => !/\blevel\b/i.test(text))).toBe(true);
    expect(textCalls.every((text) => !/\btime\b/i.test(text))).toBe(true);
  });

  test('renders game-over summary with prior best outcome and dual restart copy', () => {
    renderer.renderGameOverScreen({
      score: 800,
      outcomeLabel: 'Best: 1200'
    });

    const textCalls = scene.add.text.mock.calls.map((call) => call[2]);

    expect(textCalls).toContain('Score: 800');
    expect(textCalls).toContain('Best: 1200');
    expect(textCalls).not.toContain('New best');
    expect(
      textCalls.some((text) => /R/i.test(text) && /click/i.test(text))
    ).toBe(true);
  });

  test('keeps start pause and game-over overlays as short next-action prompts', () => {
    const manualLines = [
      '←/→ Move',
      '↑ Rotate',
      '↓ Soft drop',
      'M Music',
      'S Sound',
      'R Restart (game over)'
    ];

    renderer.renderStartScreen();
    let labels = scene.add.text.mock.calls.map((call) => call[2]);
    expect(labels).toContain('Press any key except P, or click');
    manualLines.forEach((line) => expect(labels).not.toContain(line));

    scene.add.text.mockClear();
    renderer.renderPauseScreen();
    labels = scene.add.text.mock.calls.map((call) => call[2]);
    expect(labels).toContain('Press P or Space to resume');
    manualLines.forEach((line) => expect(labels).not.toContain(line));

    scene.add.text.mockClear();
    renderer.renderGameOverScreen({ score: 10, outcomeLabel: 'Best: 10' });
    labels = scene.add.text.mock.calls.map((call) => call[2]);
    expect(labels.some((text) => /R/i.test(text) && /click/i.test(text))).toBe(
      true
    );
    manualLines.forEach((line) => expect(labels).not.toContain(line));
  });
});
