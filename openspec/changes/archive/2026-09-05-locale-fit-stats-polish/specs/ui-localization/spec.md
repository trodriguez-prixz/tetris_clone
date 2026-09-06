# ui-localization Delta

## ADDED Requirements

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
