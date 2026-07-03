import GameStateMachine, { GAME_STATES } from '../src/logic/GameStateMachine.js';
import EventBus, { EVENTS } from '../src/events/EventBus.js';

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

const trackLifecycleEvents = () => {
  const events = [];

  [
    EVENTS.GAME_START,
    EVENTS.GAME_PAUSED,
    EVENTS.GAME_RESUMED,
    EVENTS.GAME_OVER
  ].forEach(event => {
    EventBus.on(event, () => events.push(event));
  });

  return events;
};

describe('GameStateMachine', () => {
  beforeEach(() => {
    EventBus.removeAllListeners();
  });

  afterEach(() => {
    EventBus.removeAllListeners();
  });

  test('starts on the start screen', () => {
    const machine = new GameStateMachine();

    expect(machine.getState()).toBe(GAME_STATES.START_SCREEN);
    expect(machine.isState(GAME_STATES.START_SCREEN)).toBe(true);
    expect(machine.isState(GAME_STATES.PLAYING)).toBe(false);
  });

  test('starts the game from the start screen and emits the start event', () => {
    const events = trackLifecycleEvents();
    const machine = createMachineInState(GAME_STATES.START_SCREEN);

    expect(machine.start()).toBe(true);

    expect(machine.getState()).toBe(GAME_STATES.PLAYING);
    expect(events).toEqual([EVENTS.GAME_START]);
  });

  test('restarts the game from game over and emits another start event', () => {
    const machine = createMachineInState(GAME_STATES.GAME_OVER);
    const events = trackLifecycleEvents();

    expect(machine.start()).toBe(true);

    expect(machine.getState()).toBe(GAME_STATES.PLAYING);
    expect(events).toEqual([EVENTS.GAME_START]);
  });

  test('pauses only while playing and emits the pause event', () => {
    const machine = createMachineInState(GAME_STATES.PLAYING);
    const events = trackLifecycleEvents();

    expect(machine.pause()).toBe(true);

    expect(machine.getState()).toBe(GAME_STATES.PAUSED);
    expect(events).toEqual([EVENTS.GAME_PAUSED]);
  });

  test('resumes only while paused and emits the resume event', () => {
    const machine = createMachineInState(GAME_STATES.PAUSED);
    const events = trackLifecycleEvents();

    expect(machine.resume()).toBe(true);

    expect(machine.getState()).toBe(GAME_STATES.PLAYING);
    expect(events).toEqual([EVENTS.GAME_RESUMED]);
  });

  test('enters game over only while playing and emits the game over event', () => {
    const machine = createMachineInState(GAME_STATES.PLAYING);
    const events = trackLifecycleEvents();

    expect(machine.gameOver()).toBe(true);

    expect(machine.getState()).toBe(GAME_STATES.GAME_OVER);
    expect(events).toEqual([EVENTS.GAME_OVER]);
  });

  test('blocks invalid transitions without changing state or emitting lifecycle events', () => {
    const invalidTransitions = [
      [GAME_STATES.START_SCREEN, ['pause', 'resume', 'gameOver']],
      [GAME_STATES.PLAYING, ['start', 'resume']],
      [GAME_STATES.PAUSED, ['start', 'pause', 'gameOver']],
      [GAME_STATES.GAME_OVER, ['pause', 'resume', 'gameOver']]
    ];

    invalidTransitions.forEach(([state, actions]) => {
      actions.forEach(action => {
        EventBus.removeAllListeners();
        const machine = createMachineInState(state);
        const events = trackLifecycleEvents();

        expect(machine[action]()).toBe(false);
        expect(machine.getState()).toBe(state);
        expect(events).toEqual([]);
      });
    });
  });
});
