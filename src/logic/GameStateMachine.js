import EventBus, { EVENTS } from '../events/EventBus.js';

export const GAME_STATES = {
  START_SCREEN: 'START_SCREEN',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  GAME_OVER: 'GAME_OVER'
};

export default class GameStateMachine {
  constructor() {
    this.currentState = GAME_STATES.START_SCREEN;
  }

  getState() {
    return this.currentState;
  }

  isState(state) {
    return this.currentState === state;
  }

  start() {
    if (this.currentState === GAME_STATES.START_SCREEN || this.currentState === GAME_STATES.GAME_OVER) {
      this.currentState = GAME_STATES.PLAYING;
      EventBus.emit(EVENTS.GAME_START);
      return true;
    }
    return false;
  }

  pause() {
    if (this.currentState === GAME_STATES.PLAYING) {
      this.currentState = GAME_STATES.PAUSED;
      EventBus.emit(EVENTS.GAME_PAUSED);
      return true;
    }
    return false;
  }

  resume() {
    if (this.currentState === GAME_STATES.PAUSED) {
      this.currentState = GAME_STATES.PLAYING;
      EventBus.emit(EVENTS.GAME_RESUMED);
      return true;
    }
    return false;
  }

  gameOver() {
    if (this.currentState === GAME_STATES.PLAYING) {
      this.currentState = GAME_STATES.GAME_OVER;
      EventBus.emit(EVENTS.GAME_OVER);
      return true;
    }
    return false;
  }
}
