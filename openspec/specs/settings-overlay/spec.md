# settings-overlay Specification

## Purpose

Make presentation preferences discoverable and editable from start/pause without interrupting active play with a modal.

## Requirements

### Requirement: Settings on start via Esc

From the start screen, Esc MUST open a Settings panel showing current preference lines. Esc again (or close) MUST return to start without starting the game. Start-key / click MUST NOT start the game while Settings is open.

#### Scenario: Esc opens and closes settings on start

- **GIVEN** the start screen is visible
- **WHEN** the player presses Esc
- **THEN** Settings is shown
- **AND WHEN** Esc is pressed again
- **THEN** Settings closes and start remains

#### Scenario: Start input ignored while settings open

- **GIVEN** Settings is open on the start screen
- **WHEN** the player presses a normal start key
- **THEN** the game does not start

### Requirement: Pause shows preference toggles

The pause overlay MUST show Ghost, Music, Sound, and Language lines with current values and key hints, stacked so they remain readable with the resume prompt. P/Space MUST still resume; toggling prefs MUST NOT resume.

#### Scenario: Pause lists preference lines

- **GIVEN** the game is paused
- **WHEN** the pause overlay is rendered with preferences
- **THEN** Ghost, Music, Sound, and Language preference lines are visible
- **AND** the resume prompt remains readable below those lines

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

### Requirement: Non-overlapping pause preference stack

When the pause overlay shows preference lines, each of title, status, preference lines (including Language), and the resume action MUST occupy distinct vertical positions. Consecutive text baselines MUST be separated by at least the caption line step used for preference rows. Preference lines and the resume action MUST NOT share the same Y coordinate.

#### Scenario: Pause preference lines clear the resume action

- **GIVEN** the game is paused
- **WHEN** the pause overlay is rendered with preferences
- **THEN** Ghost, Music, and Sound preference lines are visible
- **AND** the resume action text is visible
- **AND** every preference line Y differs from the resume action Y by at least one preference line step
- **AND** consecutive preference line Y values differ by at least one preference line step

### Requirement: Non-overlapping settings preference stack

When the Settings panel shows preference lines, preference rows and the close action MUST occupy distinct vertical positions with the same minimum separation as pause.

#### Scenario: Settings preference lines clear the close action

- **GIVEN** Settings is open
- **WHEN** the settings overlay is rendered with preferences
- **THEN** Ghost, Music, and Sound preference lines are visible
- **AND** the close action text is visible
- **AND** every preference line Y differs from the close action Y by at least one preference line step

### Requirement: Ghost hotkey

Pressing G MUST toggle ghostEnabled, persist preferences, and update ghost rendering without changing game state.

#### Scenario: G toggles ghost during play

- **GIVEN** the game is playing with ghost enabled
- **WHEN** the player presses G
- **THEN** ghostEnabled becomes false and preferences are saved
