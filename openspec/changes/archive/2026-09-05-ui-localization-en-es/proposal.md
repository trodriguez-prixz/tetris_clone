# Proposal: UI localization (EN/ES)

## Intent

Player-facing UI is English-only. Add persisted English/Spanish locale selectable from Settings (and `L`), covering overlays, sidebar, controls help, audio status, feedback, and game-over outcome (PLAN.md Phase 18).

## Scope

### In Scope

- In-repo i18n catalogs + `t(key, params)` for EN/ES
- Persist `locale` on preferences; default/corrupt → `en`
- Settings language line + `L` cycle; live UI refresh
- Translate inventory surfaces; keep hotkey letters stable
- Tests; PLAN Phase 18 closeout

### Out of Scope

- Browser auto-detect, more locales, RTL, console log translation, remaps

## Capabilities

### New Capabilities

- `ui-localization`: Locale catalogs, `t()`, active locale API, coverage of player-facing strings

### Modified Capabilities

- `player-preferences`: Persist `locale`
- `settings-overlay`: Language line + Settings/`L` discoverability
- `controls-help`: Localized Controls lines including `L` language hint

## Approach

1. Add `src/i18n/` with EN/ES catalogs and `t`/`setLocale`/`getLocale`.
2. Extend StorageManager preferences with validated `locale`.
3. Route overlay/controls/stats/audio/feedback/game-over copy through `t()`.
4. GameScene toggles locale, saves prefs, refreshes visible UI.

## Affected Areas

| Area                                   | Impact   | Description         |
| -------------------------------------- | -------- | ------------------- |
| `src/i18n/*`                           | New      | Catalogs + API      |
| `src/utils/storage.js`                 | Modified | `locale` pref       |
| `src/config/controlsHelp.js`           | Modified | Localized lines     |
| Overlay/Score/Audio/Input/UI/GameScene | Modified | `t()` + refresh     |
| tests / PLAN / openspec                | Modified | Coverage + Phase 18 |

## Risks

| Risk                        | Likelihood | Mitigation                                      |
| --------------------------- | ---------- | ----------------------------------------------- |
| Missing keys                | Med        | Fallback to key/en; tests for catalog parity    |
| Layout overflow (ES longer) | Med        | Prefer concise ES; reuse Phase 17 stack gaps    |
| L conflicts                 | Low        | Bind only as locale cycle; document in Controls |

## Rollback Plan

Revert i18n module, locale pref, renderer wiring, and related tests. Ghost/audio prefs remain.

## Dependencies

- Confirmed Phase 18 locked decisions

## Success Criteria

- [ ] EN/ES switch via Settings and `L`; persists
- [ ] Inventory surfaces localize; hotkeys unchanged
- [ ] Live refresh without run restart
- [ ] lint/test/build pass
