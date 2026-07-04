import { EVENTS } from '../events/GameEvents.js';

export const GAME_STATES = {
  START_SCREEN: 'START_SCREEN',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  GAME_OVER: 'GAME_OVER'
};

export default class GameStateMachine {
  #currentState;

  constructor() {
    this.#currentState = GAME_STATES.START_SCREEN;
    this.domainEvents = [];
  }

  recordEvent(type, payload) {
    this.domainEvents.push({ type, payload });
  }

  consumeEvents() {
    const events = [...this.domainEvents];
    this.domainEvents = [];
    return events;
  }

  getState() {
    return this.#currentState;
  }

  isState(state) {
    return this.#currentState === state;
  }

  transitionResult(changed, from, to, event = null) {
    return { changed, from, to, event };
  }

  transitionTo(allowedFromStates, to, event = null) {
    const from = this.#currentState;

    if (!allowedFromStates.includes(from)) {
      return this.transitionResult(false, from, from);
    }

    this.#currentState = to;
    if (event) {
      this.recordEvent(event);
    }

    return this.transitionResult(true, from, to, event);
  }

  start() {
    return this.transitionTo(
      [GAME_STATES.START_SCREEN],
      GAME_STATES.PLAYING,
      EVENTS.GAME_START
    );
  }

  restart() {
    return this.transitionTo(
      [GAME_STATES.GAME_OVER],
      GAME_STATES.PLAYING,
      EVENTS.GAME_START
    );
  }

  markGameOver() {
    return this.transitionTo([GAME_STATES.PLAYING], GAME_STATES.GAME_OVER);
  }

  pause() {
    return this.transitionTo(
      [GAME_STATES.PLAYING],
      GAME_STATES.PAUSED,
      EVENTS.GAME_PAUSED
    );
  }

  resume() {
    return this.transitionTo(
      [GAME_STATES.PAUSED],
      GAME_STATES.PLAYING,
      EVENTS.GAME_RESUMED
    );
  }

  gameOver() {
    return this.transitionTo(
      [GAME_STATES.PLAYING],
      GAME_STATES.GAME_OVER,
      EVENTS.GAME_OVER
    );
  }
}
