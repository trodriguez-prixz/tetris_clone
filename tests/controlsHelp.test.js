import { CONTROLS_HELP_LINES } from '../src/config/controlsHelp.js';

describe('controlsHelp contract', () => {
  const texts = () => CONTROLS_HELP_LINES.map((line) => line.text);

  test('lists every supported keyboard help line and excludes hard drop', () => {
    expect(CONTROLS_HELP_LINES[0]).toEqual({
      text: 'Controls',
      emphasis: true
    });

    expect(texts()).toEqual(
      expect.arrayContaining([
        '←/→ Move',
        '↑ Rotate',
        '↓ Soft drop',
        'P/Space Pause',
        'M Music',
        'S Sound',
        'R Restart (game over)'
      ])
    );

    expect(texts().join('\n').toLowerCase()).not.toMatch(/hard\s*drop/);
  });

  test('keeps non-header lines caption-style (no emphasis flag)', () => {
    CONTROLS_HELP_LINES.slice(1).forEach((line) => {
      expect(line.emphasis).toBeFalsy();
      expect(line.text.length).toBeGreaterThan(0);
    });
  });
});
