# gentle-ai.sdd-preproposal/v1

revision: 0A38EA56-8E8A-458B-8EE3-9A553B870563
changeName: game-over-outcome-clarity
artifactStore: openspec
research:
selected: false
status: unselected
exploration:
status: skipped
reason: Phase 14 in PLAN.md already documents problem, targets, boundaries, and out-of-scope items after code audit.
productDecisions:
status: confirmed
items: - id: overlay-summary
choice: final-score-and-best-outcome
detail: Show final score and best-score outcome on the game-over overlay; omit lines/level/time from the overlay. - id: restart-input
choice: keyboard-and-pointer
detail: Keep R; add pointer/click restart on game-over overlay only. - id: time-field
choice: time
detail: Use `time` consistently across snapshot and StorageManager.updateStatistics. - id: boundaries
choice: preserve
detail: No Phaser/storage in GameState; OverlayRenderer stays presentation-only.
proposal_ready: true
evidenceReferences:

- PLAN.md Phase 14
- src/logic/GameState.js getGameOverStatsSnapshot
- src/utils/storage.js updateStatistics
- src/scenes/components/OverlayRenderer.js
- src/scenes/GameScene.js onGameOver / persistGameOverStats
