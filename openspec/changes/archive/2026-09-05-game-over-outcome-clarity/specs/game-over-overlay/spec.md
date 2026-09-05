# game-over-overlay Specification

## Purpose

Game-over overlay: final score, best-score outcome, and restart affordances only.

## Requirements

### Requirement: Final score and best-score outcome

Overlay MUST show final score and one best-score outcome (`New best` or `Best: N`). MUST NOT show lines, level, or time.

#### Scenario: New best score outcome

- GIVEN final score beats stored best
- WHEN game-over overlay is shown
- THEN final score and new-best outcome appear
- AND lines, level, and time do not

#### Scenario: Prior best score outcome

- GIVEN final score ≤ stored best N
- WHEN game-over overlay is shown
- THEN final score and best-remains-N appear
- AND lines, level, and time do not

### Requirement: Keyboard restart remains R

While game-over overlay is visible, R MUST restart and clear the overlay.

#### Scenario: R restarts after game over

- GIVEN game-over overlay is visible
- WHEN player presses R
- THEN game restarts and overlay clears

### Requirement: Pointer restart on game-over overlay only

Pointer/click MUST restart only while game-over overlay is visible; bindings MUST clear on dismiss/restart. MUST NOT trigger game-over restart outside game-over.

#### Scenario: Click restarts on game-over overlay

- GIVEN game-over overlay visible with pointer restart bound
- WHEN player clicks/taps
- THEN game restarts and overlay clears

#### Scenario: Pointer restart inactive outside game-over

- GIVEN playing, paused, or start (not game-over)
- WHEN player clicks/taps
- THEN click does not trigger game-over restart

### Requirement: Restart action copy

Game-over action text MUST indicate restart via R and pointer/click.

#### Scenario: Action mentions both restart paths

- GIVEN game-over overlay is shown
- WHEN content is rendered
- THEN action text mentions R and pointer/click restart

### Requirement: Presentation and wiring boundaries

Overlay presentation MUST NOT read/write storage or decide high-score policy. Scene orchestration MUST supply run summary and own storage/wiring.

#### Scenario: Overlay receives summary; does not persist

- GIVEN prepared run summary at game over
- WHEN overlay renders game over
- THEN it shows supplied score and outcome
- AND it does not call storage or set high-score policy
