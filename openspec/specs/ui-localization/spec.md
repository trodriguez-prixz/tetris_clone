# ui-localization Specification

## Purpose

Provide English/Spanish player-facing copy via in-repo catalogs without changing Tetris rules.

## Requirements

### Requirement: Locale catalogs and t()

The system MUST expose `en` and `es` catalogs and a `t(key, params)` helper. Missing keys MUST fall back safely (English string or key). Interpolation MUST support `{name}` placeholders.

#### Scenario: Spanish translation for a known key

- **GIVEN** locale is `es`
- **WHEN** `t('overlay.pause.title')` is called
- **THEN** the Spanish pause title is returned

#### Scenario: Unknown key falls back

- **GIVEN** any locale
- **WHEN** `t('missing.key')` is called
- **THEN** a non-throwing fallback string is returned

### Requirement: Locale setter validates

`setLocale` MUST accept only `en` or `es`; other values MUST leave locale as `en` (or previous valid).

#### Scenario: Invalid locale rejected

- **GIVEN** locale is `en`
- **WHEN** `setLocale('fr')` is called
- **THEN** active locale remains `en`
