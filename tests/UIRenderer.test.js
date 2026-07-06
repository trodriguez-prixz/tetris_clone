import UIRenderer from '../src/scenes/components/UIRenderer.js';
import AudioIndicatorRenderer from '../src/scenes/components/AudioIndicatorRenderer.js';
import PreviewRenderer from '../src/scenes/components/PreviewRenderer.js';
import ScoreDisplayRenderer from '../src/scenes/components/ScoreDisplayRenderer.js';

jest.mock('../src/scenes/components/AudioIndicatorRenderer.js', () =>
  jest.fn()
);
jest.mock('../src/scenes/components/PreviewRenderer.js', () => jest.fn());
jest.mock('../src/scenes/components/ScoreDisplayRenderer.js', () => jest.fn());

const createDisplayObject = () => ({
  setOrigin: jest.fn().mockReturnThis(),
  setAlpha: jest.fn().mockReturnThis(),
  setText: jest.fn().mockReturnThis(),
  destroy: jest.fn()
});

const createGraphicsObject = () => ({
  lineStyle: jest.fn().mockReturnThis(),
  strokeRect: jest.fn().mockReturnThis()
});

const buildScene = () => ({
  add: {
    rectangle: jest.fn(() => createDisplayObject()),
    graphics: jest.fn(() => createGraphicsObject()),
    text: jest.fn(() => createDisplayObject())
  },
  scale: { height: 840 },
  time: { now: 1000 },
  tweens: {
    add: jest.fn(() => ({ stop: jest.fn() }))
  }
});

describe('UIRenderer action feedback', () => {
  let scene;
  let previewRenderer;
  let scoreDisplayRenderer;

  beforeEach(() => {
    jest.clearAllMocks();
    scene = buildScene();
    previewRenderer = { destroy: jest.fn(), renderPreview: jest.fn() };
    scoreDisplayRenderer = { destroy: jest.fn() };
    PreviewRenderer.mockImplementation(() => previewRenderer);
    ScoreDisplayRenderer.mockImplementation(() => scoreDisplayRenderer);
    AudioIndicatorRenderer.mockImplementation(() => ({}));
  });

  test('shows and fades unavailable-action text in the sidebar', () => {
    const uiRenderer = new UIRenderer(scene, {});
    const feedbackText = scene.add.text.mock.results.at(-1).value;

    uiRenderer.showUnavailableAction('Move blocked');

    expect(feedbackText.setText).toHaveBeenCalledWith('Move blocked');
    expect(feedbackText.setAlpha).toHaveBeenCalledWith(1);
    expect(scene.tweens.add).toHaveBeenCalledWith(
      expect.objectContaining({
        targets: feedbackText,
        alpha: 0,
        ease: 'Power2'
      })
    );
  });

  test('throttles repeated feedback without hiding different unavailable actions', () => {
    const uiRenderer = new UIRenderer(scene, {});
    const feedbackText = scene.add.text.mock.results.at(-1).value;

    uiRenderer.showUnavailableAction('Move blocked');
    scene.time.now = 1100;
    uiRenderer.showUnavailableAction('Move blocked');
    uiRenderer.showUnavailableAction('Rotation blocked');

    expect(feedbackText.setText).toHaveBeenCalledTimes(2);
    expect(feedbackText.setText).toHaveBeenCalledWith('Move blocked');
    expect(feedbackText.setText).toHaveBeenCalledWith('Rotation blocked');
  });
});
