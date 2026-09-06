import { getControlsHelpLines } from '../src/config/controlsHelp.js';
import { setLocale } from '../src/i18n/index.js';

describe('controlsHelp contract', () => {
  afterEach(() => {
    setLocale('en');
  });

  const texts = () => getControlsHelpLines().map((line) => line.text);

  test('lists every supported keyboard help line and excludes hard drop', () => {
    expect(getControlsHelpLines()[0]).toEqual({
      text: 'Controls',
      emphasis: true
    });

    expect(texts()).toEqual(
      expect.arrayContaining([
        '←/→ Move',
        '↑ Rotate',
        '↓ Soft drop',
        'P/Space Pause',
        'G Ghost',
        'M Music',
        'S Sound',
        'L Language',
        'R Restart (game over)'
      ])
    );

    expect(texts().join('\n').toLowerCase()).not.toMatch(/hard\s*drop/);
  });

  test('keeps non-header lines caption-style (no emphasis flag)', () => {
    getControlsHelpLines()
      .slice(1)
      .forEach((line) => {
        expect(line.emphasis).toBeFalsy();
        expect(line.text.length).toBeGreaterThan(0);
      });
  });
});
