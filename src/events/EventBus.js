import Phaser from 'phaser';

// Singleton Event Bus for global game events
const EventBus = new Phaser.Events.EventEmitter();

export const EVENTS = {
  GAME_START: 'game-start',
  GAME_OVER: 'game-over',
  GAME_PAUSED: 'game-paused',
  GAME_RESUMED: 'game-resumed',
  LEVEL_UP: 'level-up',
  SCORE_UPDATED: 'score-updated',
  LINES_CLEARED: 'lines-cleared',
  TETRAMINO_LOCKED: 'tetramino-locked',
  PIECE_PLACED: 'piece-placed',
  HARD_DROP: 'hard-drop',
  NEXT_SHAPE_UPDATED: 'next-shape-updated'
};

export default EventBus;
