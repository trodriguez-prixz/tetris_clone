# ui-localization Delta

## ADDED Requirements

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
