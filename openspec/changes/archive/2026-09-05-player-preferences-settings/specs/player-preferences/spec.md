# player-preferences Specification

## Purpose

Persist presentation preferences for ghost piece and audio across sessions.

## ADDED Requirements

### Requirement: Preferences persistence contract

The system MUST persist `{ ghostEnabled, musicMuted, soundEnabled }` with defaults `{ true, false, true }`. Corrupt or missing storage MUST fall back to defaults without throwing.

#### Scenario: Defaults when empty

- **GIVEN** no preferences key in storage
- **WHEN** preferences are loaded
- **THEN** ghostEnabled is true, musicMuted is false, soundEnabled is true

#### Scenario: Round-trip save and load

- **GIVEN** saved preferences with ghostEnabled false and musicMuted true
- **WHEN** preferences are loaded
- **THEN** the same values are returned

#### Scenario: Corrupt JSON falls back

- **GIVEN** preferences storage contains invalid JSON
- **WHEN** preferences are loaded
- **THEN** defaults are returned

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
