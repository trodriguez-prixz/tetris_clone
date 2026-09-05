# game-over-stats-contract Specification

## Purpose

Align game-over snapshot elapsed seconds with `Score.getAllStats()` / storage field `time`; keep domain state pure.

## Requirements

### Requirement: Snapshot elapsed field is `time`

Snapshot MUST expose elapsed seconds as `time` matching `Score.getAllStats().time`. MUST NOT use `gameTime` as that key.

#### Scenario: Snapshot exposes `time`

- GIVEN ended run with elapsed seconds T
- WHEN snapshot is produced
- THEN snapshot includes `time` = T
- AND does not use `gameTime` as that field

#### Scenario: Snapshot `time` matches getAllStats

- GIVEN `getAllStats()` returns `time: T`
- WHEN snapshot is produced after updating game time
- THEN snapshot.`time` equals T

### Requirement: Storage accumulates `time`

`StorageManager.updateStatistics` MUST add run `time` into `totalTime`. Stats with `gameTime` but no `time` MUST NOT count as elapsed seconds.

#### Scenario: totalTime increases by run time

- GIVEN `totalTime` = A and run stats with `time` = T
- WHEN statistics are updated
- THEN stored `totalTime` becomes A + T

#### Scenario: Misnamed elapsed field does not add seconds

- GIVEN stats with `gameTime` but no `time`
- WHEN statistics are updated
- THEN `totalTime` does not increase by that `gameTime`

### Requirement: Pure domain snapshot ownership

Domain snapshot production MUST NOT use Phaser or storage I/O. Scene orchestration MUST obtain the snapshot and persist high score / statistics.

#### Scenario: Domain snapshot has no storage side effects

- GIVEN pure game state after a run
- WHEN snapshot is requested
- THEN plain stats object returned with no storage I/O

#### Scenario: Scene wires snapshot to storage

- GIVEN game over reached
- WHEN scene persists game-over stats
- THEN it uses the domain snapshot
- AND saves high score when run beats stored best
- AND updates statistics with a `time`-compatible object
