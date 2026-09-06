# player-preferences Specification

## Purpose

Persist presentation preferences for ghost piece, audio, and UI locale across sessions.

## Requirements

### Requirement: Preferences persistence contract

The system MUST persist `{ ghostEnabled, musicMuted, soundEnabled, locale }` with defaults `{ true, false, true, 'en' }`. Corrupt or missing storage MUST fall back to defaults without throwing. `locale` MUST be `'en'` or `'es'`; any other value MUST coerce to `'en'`.

#### Scenario: Defaults when empty

- **GIVEN** no preferences key in storage
- **WHEN** preferences are loaded
- **THEN** ghostEnabled is true, musicMuted is false, soundEnabled is true, locale is `en`

#### Scenario: Round-trip save and load including locale

- **GIVEN** saved preferences with locale `es` and ghostEnabled false
- **WHEN** preferences are loaded
- **THEN** locale is `es` and ghostEnabled is false

#### Scenario: Corrupt JSON falls back

- **GIVEN** preferences storage contains invalid JSON
- **WHEN** preferences are loaded
- **THEN** defaults are returned

#### Scenario: Invalid locale coerces to en

- **GIVEN** preferences storage has locale `fr`
- **WHEN** preferences are loaded
- **THEN** locale is `en`

### Requirement: Ghost rendering follows preference

Board rendering MUST draw the landing ghost only when ghostEnabled is true.

#### Scenario: Ghost off skips draw

- **GIVEN** ghostEnabled is false and an active piece exists
- **WHEN** the board renderer updates
- **THEN** no ghost blocks are created

### Requirement: Audio toggles persist

Music and SFX toggles MUST load from preferences on setup and MUST save preferences when toggled.

#### Scenario: Toggle music persists

- **GIVEN** audio controller is set up from preferences
- **WHEN** music is toggled
- **THEN** musicMuted is inverted and preferences are saved
