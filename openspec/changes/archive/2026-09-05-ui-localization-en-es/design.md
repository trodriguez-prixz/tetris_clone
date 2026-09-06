# Design: UI localization (EN/ES)

## Technical Approach

Add `src/i18n/index.js` with module-level locale, `en`/`es` message maps, `t(key, params)`, `getLocale`, `setLocale`, and `normalizeLocale`. Extend preferences with `locale`. Renderers call `t()` when creating/updating text. `controlsHelp` exports `getControlsHelpLines()` using `t()`. GameScene loads locale on create, binds `L` via InputController, and `refreshLocalizedUI()` re-renders overlays (if open), Controls, score labels, and audio indicators.

## Architecture Decisions

| Decision      | Choice                           | Rationale                                     |
| ------------- | -------------------------------- | --------------------------------------------- |
| Catalog home  | `src/i18n/`                      | Keeps Phaser/components free of string tables |
| Key style     | Dot keys (`overlay.pause.title`) | Stable across languages                       |
| Default       | `en`                             | Matches current shipped copy                  |
| Language line | `L Language: English\|Español`   | Discoverable; cycles both ways                |
| Refresh       | Explicit scene refresh helper    | Avoid full scene restart                      |

## File Changes

| File                                   | Action                                  |
| -------------------------------------- | --------------------------------------- |
| `src/i18n/en.js`, `es.js`, `index.js`  | New                                     |
| `src/utils/storage.js`                 | `locale` on prefs                       |
| `src/config/controlsHelp.js`           | Localized getter                        |
| Overlay/Score/Audio/Input/UI/GameScene | `t()` + refresh                         |
| tests                                  | i18n, storage, overlay, controls, scene |
| PLAN.md                                | Phase 18                                |

## Testing Strategy

Strict TDD: i18n + storage first; then renderer copy; then L/Settings refresh. English remains default so existing English assertions stay valid where locale unset.

## Rollback Plan

Remove i18n module and locale wiring; restore hardcoded English strings.
