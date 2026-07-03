import GameStateMachine, { GAME_STATES } from '../src/logic/GameStateMachine.js';
import { EVENTS } from '../src/events/GameEvents.js';

const createMachineInState = (state) => {
  const machine = new GameStateMachine();

  if (state === GAME_STATES.PLAYING) {
    machine.start();
  }

  if (state === GAME_STATES.PAUSED) {
    machine.start();
    machine.pause();
  }

  if (state === GAME_STATES.GAME_OVER) {
    machine.start();
    machine.gameOver();
  }

  return machine;
};

describe('GameStateMachine', () => {
  test('starts on the start screen', () => {
    const machine = new GameStateMachine();

    expect(machine.getState()).toBe(GAME_STATES.START_SCREEN);
    expect(machine.isState(GAME_STATES.START_SCREEN)).toBe(true);
    expect(machine.isState(GAME_STATES.PLAYING)).toBe(false);
  });

  test('starts the game from the start screen and records the start event', () => {
    const machine = createMachineInState(GAME_STATES.START_SCREEN);

    expect(machine.start()).toEqual({
      changed: true,
      from: GAME_STATES.START_SCREEN,
      to: GAME_STATES.PLAYING,
      event: EVENTS.GAME_START
    });

    expect(machine.getState()).toBe(GAME_STATES.PLAYING);
    expect(machine.consumeEvents()).toEqual([{ type: EVENTS.GAME_START, payload: undefined }]);
  });

  test('restarts the game from game over and records another start event', () => {
    const machine = createMachineInState(GAME_STATES.GAME_OVER);
    machine.consumeEvents();

    expect(machine.restart()).toEqual({
      changed: true,
      from: GAME_STATES.GAME_OVER,
      to: GAME_STATES.PLAYING,
      event: EVENTS.GAME_START
    });

    expect(machine.getState()).toBe(GAME_STATES.PLAYING);
    expect(machine.consumeEvents()).toEqual([{ type: EVENTS.GAME_START, payload: undefined }]);
  });

  test('marks game over without recording a duplicate game over event', () => {
    const machine = createMachineInState(GAME_STATES.PLAYING);
    machine.consumeEvents();

    expect(machine.markGameOver()).toEqual({
      changed: true,
      from: GAME_STATES.PLAYING,
      to: GAME_STATES.GAME_OVER,
      event: null
    });

    expect(machine.getState()).toBe(GAME_STATES.GAME_OVER);
    expect(machine.consumeEvents()).toEqual([]);
  });

  test('pauses only while playing and records the pause event', () => {
    const machine = createMachineInState(GAME_STATES.PLAYING);
    machine.consumeEvents();

    expect(machine.pause()).toEqual({
      changed: true,
      from: GAME_STATES.PLAYING,
      to: GAME_STATES.PAUSED,
      event: EVENTS.GAME_PAUSED
    });

    expect(machine.getState()).toBe(GAME_STATES.PAUSED);
    expect(machine.consumeEvents()).toEqual([{ type: EVENTS.GAME_PAUSED, payload: undefined }]);
  });

  test('resumes only while paused and records the resume event', () => {
    const machine = createMachineInState(GAME_STATES.PAUSED);
    machine.consumeEvents();

    expect(machine.resume()).toEqual({
      changed: true,
      from: GAME_STATES.PAUSED,
      to: GAME_STATES.PLAYING,
      event: EVENTS.GAME_RESUMED
    });

    expect(machine.getState()).toBe(GAME_STATES.PLAYING);
    expect(machine.consumeEvents()).toEqual([{ type: EVENTS.GAME_RESUMED, payload: undefined }]);
  });

  test('enters game over only while playing and records the game over event', () => {
    const machine = createMachineInState(GAME_STATES.PLAYING);
    machine.consumeEvents();

    expect(machine.gameOver()).toEqual({
      changed: true,
      from: GAME_STATES.PLAYING,
      to: GAME_STATES.GAME_OVER,
      event: EVENTS.GAME_OVER
    });

    expect(machine.getState()).toBe(GAME_STATES.GAME_OVER);
    expect(machine.consumeEvents()).toEqual([{ type: EVENTS.GAME_OVER, payload: undefined }]);
  });

  test('blocks invalid transitions without changing state or recording lifecycle events', () => {
    const invalidTransitions = [
      [GAME_STATES.START_SCREEN, ['pause', 'resume', 'gameOver']],
      [GAME_STATES.PLAYING, ['start', 'restart', 'resume']],
      [GAME_STATES.PAUSED, ['start', 'restart', 'pause', 'gameOver', 'markGameOver']],
      [GAME_STATES.GAME_OVER, ['start', 'pause', 'resume', 'gameOver', 'markGameOver']]
    ];

    invalidTransitions.forEach(([state, actions]) => {
      actions.forEach(action => {
        const machine = createMachineInState(state);
        machine.consumeEvents();

        expect(machine[action]()).toEqual({
          changed: false,
          from: state,
          to: state,
          event: null
        });
        expect(machine.getState()).toBe(state);
        expect(machine.consumeEvents()).toEqual([]);
      });
    });
  });
});
