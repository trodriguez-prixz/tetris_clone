import ScoreDisplayRenderer from '../src/scenes/components/ScoreDisplayRenderer.js';
import { VISUAL_SYSTEM } from '../src/config/settings.js';
import EventBus, { EVENTS } from '../src/events/EventBus.js';

const createTextObject = (text) => ({
  text,
  setOrigin: jest.fn().mockReturnThis(),
  setText: jest.fn(function setText(nextText) {
    this.text = nextText;
    return this;
  }),
  setFill: jest.fn().mockReturnThis()
});

const buildScene = () => ({
  add: {
    text: jest.fn((x, y, text) => createTextObject(text))
  },
  tweens: {
    add: jest.fn()
  }
});

const gameState = {
  score: {
    formatTime: (time) => `0:${String(time).padStart(2, '0')}`
  }
};

describe('ScoreDisplayRenderer', () => {
  let scene;
  let renderer;

  beforeEach(() => {
    localStorage.clear();
    scene = buildScene();
    renderer = new ScoreDisplayRenderer(scene, gameState);
  });

  afterEach(() => {
    renderer.destroy();
  });

  test('renders score, level, lines, timer, and high score with a consistent hierarchy', () => {
    expect(scene.add.text).toHaveBeenCalledWith(
      expect.any(Number),
      expect.any(Number),
      'Score: 0',
      expect.objectContaining({
        fontFamily: VISUAL_SYSTEM.typography.fontFamily,
        fontSize: VISUAL_SYSTEM.typography.size.metric,
        fill: VISUAL_SYSTEM.palette.text.primary,
        fontStyle: VISUAL_SYSTEM.typography.weight.emphasis
      })
    );
    expect(scene.add.text).toHaveBeenCalledWith(
      expect.any(Number),
      expect.any(Number),
      'Level: 1',
      expect.objectContaining({
        fontSize: VISUAL_SYSTEM.typography.size.metric,
        fill: VISUAL_SYSTEM.palette.text.primary,
        fontStyle: VISUAL_SYSTEM.typography.weight.emphasis
      })
    );
    expect(scene.add.text).toHaveBeenCalledWith(
      expect.any(Number),
      expect.any(Number),
      'Lines: 0',
      expect.objectContaining({
        fontSize: VISUAL_SYSTEM.typography.size.metric,
        fill: VISUAL_SYSTEM.palette.text.primary,
        fontStyle: VISUAL_SYSTEM.typography.weight.emphasis
      })
    );
    expect(scene.add.text).toHaveBeenCalledWith(
      expect.any(Number),
      expect.any(Number),
      'Best: 0',
      expect.objectContaining({
        fontSize: VISUAL_SYSTEM.typography.size.body,
        fill: VISUAL_SYSTEM.palette.text.secondary,
        fontStyle: VISUAL_SYSTEM.typography.weight.regular
      })
    );
    expect(scene.add.text).toHaveBeenCalledWith(
      expect.any(Number),
      expect.any(Number),
      'Time: 0:00',
      expect.objectContaining({
        fontSize: VISUAL_SYSTEM.typography.size.body,
        fill: VISUAL_SYSTEM.palette.text.secondary,
        fontStyle: VISUAL_SYSTEM.typography.weight.regular
      })
    );
  });

  test('keeps score updates and new-best highlight behavior unchanged', () => {
    EventBus.emit(EVENTS.SCORE_UPDATED, {
      stats: { score: 1000, lines: 2, pieces: 3, tetrises: 0 }
    });

    expect(renderer.scoreText.setText).toHaveBeenCalledWith('Score: 1,000');
    expect(renderer.linesText.setText).toHaveBeenCalledWith('Lines: 2');
    expect(renderer.piecesText.setText).toHaveBeenCalledWith('Pieces: 3');
    expect(renderer.tetrisesText.setText).toHaveBeenCalledWith('Tetrises: 0');
    expect(renderer.highScoreText.setText).toHaveBeenCalledWith('Best: 1,000');
    expect(renderer.highScoreText.setFill).toHaveBeenCalledWith(
      VISUAL_SYSTEM.palette.accent.red
    );
  });
});
