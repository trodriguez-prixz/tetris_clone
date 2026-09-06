import { t } from '../i18n/index.js';

/**
 * Shared controls-help copy for the persistent sidebar legend.
 * Keep aligned with InputController bindings; do not document unwired actions.
 */
export const getControlsHelpLines = () => [
  { text: t('controls.title'), emphasis: true },
  { text: t('controls.move') },
  { text: t('controls.rotate') },
  { text: t('controls.softDrop') },
  { text: t('controls.pause') },
  { text: t('controls.ghost') },
  { text: t('controls.music') },
  { text: t('controls.sound') },
  { text: t('controls.language') },
  { text: t('controls.restart') }
];
