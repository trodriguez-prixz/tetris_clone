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

### Requirement: Spanish Stats title is localized

The Spanish catalog MUST provide a localized `stats.title` distinct from the English `STATS` label. English MUST remain `STATS`.

#### Scenario: Spanish stats title

- **GIVEN** locale is `es`
- **WHEN** `t('stats.title')` is called
- **THEN** the returned string is `ESTADÍSTICAS`

#### Scenario: English stats title unchanged

- **GIVEN** locale is `en`
- **WHEN** `t('stats.title')` is called
- **THEN** the returned string is `STATS`

### Requirement: Preview next label is localized

The next-piece preview label MUST use catalog key `preview.next`. English MUST be `NEXT`. Spanish MUST be `SIGUIENTE`. Changing locale MUST refresh the visible preview label without requiring a run restart.

#### Scenario: English preview next label

- **GIVEN** locale is `en`
- **WHEN** the preview label is rendered or refreshed
- **THEN** the label text is `NEXT`

#### Scenario: Spanish preview next label

- **GIVEN** locale is `es`
- **WHEN** the preview label is rendered or refreshed
- **THEN** the label text is `SIGUIENTE`
