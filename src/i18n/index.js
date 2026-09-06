import { en } from './en.js';
import { es } from './es.js';

export const SUPPORTED_LOCALES = ['en', 'es'];
export const DEFAULT_LOCALE = 'en';

const catalogs = { en, es };

let activeLocale = DEFAULT_LOCALE;

export const normalizeLocale = (locale) =>
  SUPPORTED_LOCALES.includes(locale) ? locale : DEFAULT_LOCALE;

export const getLocale = () => activeLocale;

export const setLocale = (locale) => {
  activeLocale = normalizeLocale(locale);
  return activeLocale;
};

export const cycleLocale = () => {
  activeLocale = activeLocale === 'en' ? 'es' : 'en';
  return activeLocale;
};

const interpolate = (template, params = {}) =>
  String(template).replace(/\{(\w+)\}/g, (_, name) =>
    params[name] !== undefined && params[name] !== null
      ? String(params[name])
      : `{${name}}`
  );

export const t = (key, params = {}) => {
  const catalog = catalogs[activeLocale] || catalogs[DEFAULT_LOCALE];
  const fallback = catalogs[DEFAULT_LOCALE][key];
  const template = catalog[key] ?? fallback ?? key;
  return interpolate(template, params);
};
