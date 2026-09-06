## MODIFIED Requirements

### Requirement: Persistent sidebar documents play and audio controls

The Controls group MUST list localized move/rotate/soft-drop/pause lines, G/M/S, language (`L`), and R restart (game-over), matching active locale.

#### Scenario: Controls include language hint

- **GIVEN** the sidebar Controls help is rendered
- **WHEN** lines are taken from the shared contract
- **THEN** a language line documenting `L` is present
- **AND** move/rotate/soft-drop/pause/audio/restart lines remain present
