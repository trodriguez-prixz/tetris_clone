## ADDED Requirements

### Requirement: Language in Settings and L hotkey

Settings and pause preference surfaces MUST show a language line with current English/Spanish label and `L` hint. Pressing `L` MUST cycle `en`↔`es`, persist preferences, and refresh visible UI without starting/resuming the game or changing `GAME_STATES`.

#### Scenario: L cycles locale and persists

- **GIVEN** preferences locale is `en`
- **WHEN** the player presses L
- **THEN** locale becomes `es` and preferences are saved

#### Scenario: Settings shows language line

- **GIVEN** Settings is open
- **WHEN** the settings overlay is rendered
- **THEN** a language preference line including `L` is visible

## MODIFIED Requirements

### Requirement: Pause shows preference toggles

The pause overlay MUST show Ghost, Music, Sound, and Language lines with current values, stacked so they remain readable with the resume prompt.

#### Scenario: Pause lists preference lines

- **GIVEN** the game is paused
- **WHEN** the pause overlay is rendered with preferences
- **THEN** Ghost, Music, Sound, and Language preference lines are visible
- **AND** the resume prompt remains readable below those lines
