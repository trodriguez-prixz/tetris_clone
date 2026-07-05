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

  test('groups stat display by gameplay priority', () => {
    expect(scene.add.text).toHaveBeenCalledWith(
      expect.any(Number),
      expect.any(Number),
      'CURRENT RUN',
      expect.objectContaining({
        fontSize: VISUAL_SYSTEM.typography.size.caption,
        fill: VISUAL_SYSTEM.palette.text.secondary,
        fontStyle: VISUAL_SYSTEM.typography.weight.emphasis
      })
    );
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
      'SESSION STATS',
      expect.objectContaining({
        fontSize: VISUAL_SYSTEM.typography.size.caption,
        fill: VISUAL_SYSTEM.palette.text.secondary,
        fontStyle: VISUAL_SYSTEM.typography.weight.emphasis
      })
    );
    expect(scene.add.text).toHaveBeenCalledWith(
      expect.any(Number),
      expect.any(Number),
      'Elapsed: 0:00',
      expect.objectContaining({
        fontSize: VISUAL_SYSTEM.typography.size.body,
        fill: VISUAL_SYSTEM.palette.text.secondary,
        fontStyle: VISUAL_SYSTEM.typography.weight.regular
      })
    );
    expect(scene.add.text).toHaveBeenCalledWith(
      expect.any(Number),
      expect.any(Number),
      'RECORD',
      expect.objectContaining({
        fontSize: VISUAL_SYSTEM.typography.size.caption,
        fill: VISUAL_SYSTEM.palette.text.secondary,
        fontStyle: VISUAL_SYSTEM.typography.weight.emphasis
      })
    );
    expect(scene.add.text).toHaveBeenCalledWith(
      expect.any(Number),
      expect.any(Number),
      'Best Score: 0',
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
    expect(renderer.highScoreText.setText).toHaveBeenCalledWith(
      'Best Score: 1,000'
    );
    expect(renderer.highScoreText.setFill).toHaveBeenCalledWith(
      VISUAL_SYSTEM.palette.accent.red
    );
  });

  test('keeps elapsed-time formatting behavior unchanged', () => {
    renderer.updateTime(5);

    expect(renderer.timeText.setText).toHaveBeenCalledWith('Elapsed: 0:05');
  });

  test('keeps level-up animation immediate and bounded', () => {
    EventBus.emit(EVENTS.LEVEL_UP, { level: 2 });

    expect(renderer.levelText.setText).toHaveBeenCalledWith('Level: 2');
    expect(scene.tweens.add).toHaveBeenCalledTimes(2);
    const tweenConfigs = scene.tweens.add.mock.calls.map(([config]) => config);
    const scaleTween = tweenConfigs.find((config) => config.scaleX);
    const alphaTween = tweenConfigs.find((config) => config.alpha);

    expect(scaleTween).toEqual(
      expect.objectContaining({
        targets: renderer.levelText,
        yoyo: true
      })
    );
    expect(scaleTween.scaleX).toBeGreaterThan(1);
    expect(scaleTween.scaleX).toBeLessThanOrEqual(1.25);
    expect(scaleTween.scaleY).toBe(scaleTween.scaleX);
    expect(scaleTween.duration).toBeGreaterThan(0);
    expect(scaleTween.duration).toBeLessThanOrEqual(180);

    expect(alphaTween).toEqual(
      expect.objectContaining({
        targets: renderer.levelText,
        yoyo: true
      })
    );
    expect(alphaTween.alpha).toBeGreaterThanOrEqual(0.5);
    expect(alphaTween.alpha).toBeLessThan(1);
    expect(alphaTween.duration).toBeGreaterThan(0);
    expect(alphaTween.duration).toBeLessThanOrEqual(120);
    tweenConfigs.forEach((config) => {
      expect(config.onComplete).toBeUndefined();
    });
  });
});
