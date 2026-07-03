import { EVENTS } from '../src/events/GameEvents.js';

describe('GameEvents', () => {
  test('lists the active domain event names used by producers and EventBus consumers', () => {
    expect(EVENTS).toEqual({
      GAME_START: 'game-start',
      GAME_OVER: 'game-over',
      GAME_PAUSED: 'game-paused',
      GAME_RESUMED: 'game-resumed',
      LEVEL_UP: 'level-up',
      SCORE_UPDATED: 'score-updated',
      LINES_CLEARED: 'lines-cleared',
      TETRAMINO_LOCKED: 'tetramino-locked',
      NEXT_SHAPE_UPDATED: 'next-shape-updated'
    });
  });
});
