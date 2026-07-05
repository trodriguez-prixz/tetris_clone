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
    expect(scene.tweens.add).toHaveBeenCalledWith(
      expect.objectContaining({
        targets: scene.add.text.mock.results[2].value,
        yoyo: true
      })
    );
  });

  test('renders standardized pause and game-over presentation content', () => {
    renderer.renderPauseScreen();
    renderer.renderGameOverScreen();

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
    expect(scene.add.text).toHaveBeenCalledWith(
      CANVAS_WIDTH / 2,
      expect.any(Number),
      'GAME OVER',
      expect.objectContaining({
        fontSize: VISUAL_SYSTEM.typography.size.overlayTitle,
        fill: VISUAL_SYSTEM.palette.accent.magenta
      })
    );
    expect(scene.add.text).toHaveBeenCalledWith(
      CANVAS_WIDTH / 2,
      expect.any(Number),
      'Run ended',
      expect.objectContaining({
        fontSize: VISUAL_SYSTEM.typography.size.overlayPrompt,
        fill: VISUAL_SYSTEM.palette.text.primary
      })
    );
    expect(scene.add.text).toHaveBeenCalledWith(
      CANVAS_WIDTH / 2,
      expect.any(Number),
      'Press R to restart',
      expect.objectContaining({
        fontSize: VISUAL_SYSTEM.typography.size.metric,
        fill: VISUAL_SYSTEM.palette.accent.cyan
      })
    );
    expect(scene.tweens.add).not.toHaveBeenCalled();
  });
});
