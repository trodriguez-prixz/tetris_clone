# settings-overlay Specification

## Purpose

Make presentation preferences discoverable and editable from start/pause without interrupting active play with a modal.

## ADDED Requirements

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

The pause overlay MUST show Ghost, Music, and Sound lines with current ON/OFF (or equivalent) and key hints. P/Space MUST still resume; toggling prefs MUST NOT resume.

#### Scenario: Pause lists preference lines

- **GIVEN** the game is paused
- **WHEN** the pause overlay is rendered with preferences
- **THEN** Ghost, Music, and Sound preference lines are visible

### Requirement: Ghost hotkey

Pressing G MUST toggle ghostEnabled, persist preferences, and update ghost rendering without changing game state.

#### Scenario: G toggles ghost during play

- **GIVEN** the game is playing with ghost enabled
- **WHEN** the player presses G
- **THEN** ghostEnabled becomes false and preferences are saved
