import {
  t,
  setLocale,
  getLocale,
  cycleLocale,
  normalizeLocale,
  DEFAULT_LOCALE
} from '../src/i18n/index.js';

describe('i18n', () => {
  afterEach(() => {
    setLocale(DEFAULT_LOCALE);
  });

  test('returns Spanish pause title when locale is es', () => {
    setLocale('es');
    expect(t('overlay.pause.title')).toBe('PAUSA');
  });

  test('localizes stats title for Spanish and English', () => {
    setLocale('es');
    expect(t('stats.title')).toBe('ESTADÍSTICAS');
    setLocale('en');
    expect(t('stats.title')).toBe('STATS');
  });

  test('localizes preview next label for Spanish and English', () => {
    setLocale('es');
    expect(t('preview.next')).toBe('SIGUIENTE');
    setLocale('en');
    expect(t('preview.next')).toBe('NEXT');
  });

  test('unknown key falls back without throwing', () => {
    expect(() => t('missing.key')).not.toThrow();
    expect(t('missing.key')).toBe('missing.key');
  });

  test('rejects invalid locale and keeps en', () => {
    setLocale('en');
    expect(setLocale('fr')).toBe('en');
    expect(getLocale()).toBe('en');
    expect(normalizeLocale('fr')).toBe('en');
  });

  test('cycles en to es and back', () => {
    setLocale('en');
    expect(cycleLocale()).toBe('es');
    expect(cycleLocale()).toBe('en');
  });

  test('interpolates placeholders', () => {
    setLocale('en');
    expect(t('overlay.gameOver.best', { score: 1200 })).toBe('Best: 1200');
  });
});
