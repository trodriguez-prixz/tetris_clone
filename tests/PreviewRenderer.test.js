import PreviewRenderer from '../src/scenes/components/PreviewRenderer.js';
import {
  PREVIEW_CELL_SIZE,
  RENDERED_BLOCK_INSET,
  TETRAMINOS,
  VISUAL_SYSTEM
} from '../src/config/settings.js';
import { setLocale } from '../src/i18n/index.js';

const createDisplayObject = () => ({
  setOrigin: jest.fn().mockReturnThis(),
  setStrokeStyle: jest.fn().mockReturnThis(),
  setText: jest.fn().mockReturnThis(),
  destroy: jest.fn()
});

const buildScene = () => ({
  add: {
    rectangle: jest.fn(() => createDisplayObject()),
    text: jest.fn(() => createDisplayObject())
  }
});

describe('PreviewRenderer', () => {
  let scene;
  let renderer;

  beforeEach(() => {
    setLocale('en');
    scene = buildScene();
    renderer = new PreviewRenderer(scene, {
      nextShapes: ['T', 'O', 'I']
    });
  });

  afterEach(() => {
    setLocale('en');
  });

  test('labels the next-piece queue with visual-system typography', () => {
    expect(scene.add.text).toHaveBeenCalledWith(
      expect.any(Number),
      expect.any(Number),
      'NEXT',
      expect.objectContaining({
        fontFamily: VISUAL_SYSTEM.typography.fontFamily,
        fontSize: VISUAL_SYSTEM.typography.size.caption,
        fill: VISUAL_SYSTEM.palette.text.secondary,
        fontStyle: VISUAL_SYSTEM.typography.weight.emphasis,
        align: 'center'
      })
    );
  });

  test('refreshes preview label when locale changes to Spanish', () => {
    setLocale('es');
    renderer.refreshLocalizedLabel();
    expect(renderer.previewLabel.setText).toHaveBeenCalledWith('SIGUIENTE');
  });
  test('renders the queued pieces larger and in separated preview slots', () => {
    renderer.renderPreview();

    expect(scene.add.rectangle).toHaveBeenCalledTimes(12);
    const renderedBlockSize =
      PREVIEW_CELL_SIZE + VISUAL_SYSTEM.spacing.xs - RENDERED_BLOCK_INSET;
    expect(scene.add.rectangle).toHaveBeenCalledWith(
      expect.any(Number),
      expect.any(Number),
      renderedBlockSize,
      renderedBlockSize,
      TETRAMINOS.T.color
    );
    expect(scene.add.rectangle).toHaveBeenNthCalledWith(
      5,
      expect.any(Number),
      expect.any(Number),
      renderedBlockSize,
      renderedBlockSize,
      TETRAMINOS.O.color
    );
    expect(scene.add.rectangle).toHaveBeenNthCalledWith(
      9,
      expect.any(Number),
      expect.any(Number),
      renderedBlockSize,
      renderedBlockSize,
      TETRAMINOS.I.color
    );

    const yPositions = scene.add.rectangle.mock.calls.map((call) => call[1]);
    const firstSlotBottom = Math.max(...yPositions.slice(0, 4));
    const secondSlotTop = Math.min(...yPositions.slice(4, 8));
    const secondSlotBottom = Math.max(...yPositions.slice(4, 8));
    const thirdSlotTop = Math.min(...yPositions.slice(8, 12));

    expect(secondSlotTop - firstSlotBottom).toBeGreaterThan(
      VISUAL_SYSTEM.spacing.sm
    );
    expect(thirdSlotTop - secondSlotBottom).toBeGreaterThan(
      VISUAL_SYSTEM.spacing.sm
    );
  });
});
