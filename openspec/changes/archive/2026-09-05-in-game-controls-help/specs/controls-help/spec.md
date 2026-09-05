# controls-help Specification

## Purpose

Make every supported keyboard control discoverable from one persistent sidebar help surface, with short contextual overlay actions that share the same key vocabulary.

## ADDED Requirements

### Requirement: Shared controls-help copy contract

The system MUST expose a shared English controls-help copy contract listing every supported player-facing keyboard action currently wired in `InputController`, including move, rotate, soft drop, pause (P and Space), music (M), sound (S), and restart (R) with an explicit game-over-only qualifier.

#### Scenario: Contract covers supported bindings

- **GIVEN** the shared controls-help module
- **WHEN** a reviewer inspects its exported help lines
- **THEN** the lines MUST include move, rotate, soft drop, pause with P/Space, music with M, sound with S, and restart with R scoped to game over
- **AND** the contract MUST NOT document hard drop or other unwired bindings

### Requirement: Persistent sidebar Controls help

During play UI construction, the sidebar MUST render one scannable Controls help block driven by the shared copy contract (not a partial hardcoded subset).

#### Scenario: Sidebar shows consolidated help

- **GIVEN** a `UIRenderer` is constructed
- **WHEN** the sidebar Controls texts are created
- **THEN** each non-header line from the shared contract MUST appear as caption text in the sidebar
- **AND** a Controls emphasis header MUST remain visible

### Requirement: Audio shortcut docs are not duplicated

`AudioIndicatorRenderer` MUST keep live music/sound status indicators and MUST NOT render a separate M/S shortcut documentation line that duplicates the Controls help.

#### Scenario: Status without shortcut duplicate

- **GIVEN** an `AudioIndicatorRenderer` is constructed
- **WHEN** its initial texts are created
- **THEN** Music and Sound status labels MUST be present
- **AND** a combined `M: Music | S: Sound` (or equivalent) shortcut doc line MUST NOT be created

### Requirement: Contextual overlays stay short and vocabulary-aligned

Start, pause, and game-over overlays MUST keep a single next-action prompt (plus existing title/status/summary as already specified) and MUST use the same key names as the persistent help where those keys appear (P, Space, R, click where applicable).

#### Scenario: Overlay actions remain short prompts

- **GIVEN** start, pause, and game-over overlays are rendered
- **WHEN** action lines are inspected
- **THEN** each overlay MUST expose one next-action prompt (not a full controls manual)
- **AND** pause action MUST mention P and Space
- **AND** game-over action MUST mention R and click
- **AND** start action MUST mention that P does not start and that click is valid
