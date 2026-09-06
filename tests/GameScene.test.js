import Phaser from 'phaser';
import GameScene from '../src/scenes/GameScene.js';
import EventBus, { EVENTS } from '../src/events/EventBus.js';
import { FAST_DROP_SPEED } from '../src/config/settings.js';
import { GAME_STATES } from '../src/logic/GameStateMachine.js';
import BoardRenderer from '../src/scenes/components/BoardRenderer.js';
import OverlayRenderer from '../src/scenes/components/OverlayRenderer.js';
import UIRenderer from '../src/scenes/components/UIRenderer.js';
import { RetroMusic } from '../src/utils/retroMusic.js';
import { SoundEffects } from '../src/utils/soundEffects.js';
import { StorageManager } from '../src/utils/storage.js';
import { setLocale } from '../src/i18n/index.js';

jest.mock('../src/scenes/components/BoardRenderer.js', () => jest.fn());
jest.mock('../src/scenes/components/OverlayRenderer.js', () => jest.fn());
jest.mock('../src/scenes/components/UIRenderer.js', () => jest.fn());
jest.mock('../src/utils/retroMusic.js', () => ({
  RetroMusic: jest.fn()
}));
jest.mock('../src/utils/soundEffects.js', () => ({
  SoundEffects: jest.fn()
}));
jest.mock('../src/utils/storage.js', () => ({
  StorageManager: {
    getBestScore: jest.fn(),
    saveHighScore: jest.fn(),
    updateStatistics: jest.fn(),
    getPreferences: jest.fn(() => ({
      ghostEnabled: true,
      musicMuted: false,
      soundEnabled: true,
      locale: 'en'
    })),
    savePreferences: jest.fn()
  }
}));

const createDisplayObject = () => ({
  setOrigin: jest.fn().mockReturnThis(),
  setFill: jest.fn().mockReturnThis(),
  setAlpha: jest.fn().mockReturnThis(),
  setText: jest.fn().mockReturnThis(),
  destroy: jest.fn()
});

const createGraphicsObject = () => ({
  lineStyle: jest.fn().mockReturnThis(),
  strokeRect: jest.fn().mockReturnThis(),
  moveTo: jest.fn().mockReturnThis(),
  lineTo: jest.fn().mockReturnThis(),
  strokePath: jest.fn().mockReturnThis(),
  destroy: jest.fn()
});

const createKey = () => ({
  isDown: false,
  on: jest.fn(),
  removeAllListeners: jest.fn()
});

const buildScene = () => {
  const scene = new GameScene();
  const sceneDouble = {
    add: {
      rectangle: jest.fn(() => createDisplayObject()),
      text: jest.fn(() => createDisplayObject()),
      graphics: jest.fn(() => createGraphicsObject())
    },
    input: {
      keyboard: {
        createCursorKeys: jest.fn(() => ({
          left: createKey(),
          right: createKey(),
          up: createKey(),
          down: createKey()
        })),
        addKey: jest.fn(() => createKey()),
        on: jest.fn(),
        off: jest.fn()
      },
      on: jest.fn(),
      off: jest.fn()
    },
    time: {
      now: 0,
      addEvent: jest.fn(() => ({
        paused: false,
        remove: jest.fn()
      }))
    },
    tweens: {
      add: jest.fn()
    }
  };

  Object.assign(scene, sceneDouble);
  return scene;
};

describe('GameScene orchestration', () => {
  let scene;
  let boardRenderer;
  let overlayRenderer;
  let uiRenderer;
  let retroMusic;
  let soundEffects;

  beforeEach(() => {
    EventBus.removeAllListeners();
    jest.clearAllMocks();
    Phaser.Input.Keyboard.JustDown.mockReturnValue(false);
    Phaser.Input.Keyboard.JustUp.mockReturnValue(false);

    boardRenderer = {
      update: jest.fn(),
      destroy: jest.fn(),
      setGhostEnabled: jest.fn()
    };
    overlayRenderer = {
      renderStartScreen: jest.fn(),
      clearStartScreen: jest.fn(),
      renderPauseScreen: jest.fn(),
      clearPauseScreen: jest.fn(),
      renderSettingsScreen: jest.fn(),
      clearSettingsScreen: jest.fn(),
      renderGameOverScreen: jest.fn(),
      clearGameOverScreen: jest.fn()
    };
    uiRenderer = {
      updateAudioIndicators: jest.fn(),
      renderPreview: jest.fn(),
      updateTime: jest.fn(),
      onScoreUpdated: jest.fn(),
      onLevelUp: jest.fn(),
      showUnavailableAction: jest.fn(),
      refreshLocalizedUI: jest.fn()
    };
    retroMusic = {
      init: jest.fn(() => true),
      play: jest.fn(),
      pause: jest.fn(),
      resume: jest.fn(),
      stop: jest.fn()
    };
    soundEffects = {
      init: jest.fn(() => true),
      isEnabled: jest.fn(() => true),
      setEnabled: jest.fn(),
      toggle: jest.fn(() => false),
      playMove: jest.fn(),
      playRotate: jest.fn(),
      playLineClear: jest.fn(),
      playLevelUp: jest.fn(),
      playGameOver: jest.fn()
    };

    BoardRenderer.mockImplementation(() => boardRenderer);
    OverlayRenderer.mockImplementation(() => overlayRenderer);
    UIRenderer.mockImplementation(() => uiRenderer);
    RetroMusic.mockImplementation(() => retroMusic);
    SoundEffects.mockImplementation(() => soundEffects);
    StorageManager.getBestScore.mockReturnValue(0);

    scene = buildScene();
  });

  afterEach(() => {
    EventBus.removeAllListeners();
    setLocale('en');
  });

  test('create wires game state, renderers, audio, inputs, and the start screen', () => {
    scene.create();

    expect(scene.gameState).toBeDefined();
    expect(scene.stateMachine.getState()).toBe(GAME_STATES.START_SCREEN);
    expect(BoardRenderer).toHaveBeenCalledWith(scene, scene.gameState);
    expect(UIRenderer).toHaveBeenCalledWith(scene, scene.gameState);
    expect(OverlayRenderer).toHaveBeenCalledWith(scene);
    expect(RetroMusic).toHaveBeenCalledWith(scene);
    expect(SoundEffects).toHaveBeenCalledWith(scene);
    expect(scene.audioController).toBeDefined();
    expect(uiRenderer.updateAudioIndicators).toHaveBeenCalledWith(false, true);
    expect(scene.input.keyboard.createCursorKeys).toHaveBeenCalled();
    expect(scene.input.keyboard.addKey).toHaveBeenCalledWith(
      Phaser.Input.Keyboard.KeyCodes.M
    );
    expect(scene.input.keyboard.addKey).toHaveBeenCalledWith(
      Phaser.Input.Keyboard.KeyCodes.S
    );
    expect(scene.input.keyboard.addKey).toHaveBeenCalledWith(
      Phaser.Input.Keyboard.KeyCodes.P
    );
    expect(scene.input.keyboard.addKey).toHaveBeenCalledWith(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );
    expect(scene.input.keyboard.on).toHaveBeenCalledWith(
      'keydown',
      expect.any(Function)
    );
    expect(scene.input.on).toHaveBeenCalledWith(
      'pointerdown',
      expect.any(Function)
    );
    expect(overlayRenderer.renderStartScreen).toHaveBeenCalledTimes(1);
  });

  test('start screen ignores pause key and starts gameplay from another input', () => {
    scene.create();
    const startTrigger = scene.input.keyboard.on.mock.calls.find(
      ([event]) => event === 'keydown'
    )[1];

    startTrigger({ keyCode: Phaser.Input.Keyboard.KeyCodes.P });

    expect(scene.stateMachine.getState()).toBe(GAME_STATES.START_SCREEN);
    expect(scene.input.keyboard.off).not.toHaveBeenCalled();
    expect(overlayRenderer.clearStartScreen).not.toHaveBeenCalled();

    scene.time.now = 100;
    startTrigger({ keyCode: 65 });

    expect(scene.input.keyboard.off).toHaveBeenCalledWith(
      'keydown',
      startTrigger
    );
    expect(scene.input.off).toHaveBeenCalledWith('pointerdown', startTrigger);
    expect(overlayRenderer.clearStartScreen).toHaveBeenCalledTimes(1);
    expect(scene.inputController.pauseGuardUntil).toBe(300);
    expect(scene.stateMachine.getState()).toBe(GAME_STATES.PLAYING);
    expect(scene.gameState.currentTetramino).toBeDefined();
    expect(uiRenderer.renderPreview).toHaveBeenCalled();
    expect(boardRenderer.update).toHaveBeenCalled();
    expect(scene.time.addEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        delay: scene.gameState.dropSpeed,
        loop: true,
        callback: expect.any(Function)
      })
    );
    expect(retroMusic.play).toHaveBeenCalled();
  });

  test('input controller routes audio toggle keys through scene actions', () => {
    scene.create();
    const muteKey = scene.input.keyboard.addKey.mock.results[0].value;
    const soundEffectsKey = scene.input.keyboard.addKey.mock.results[1].value;
    const muteHandler = muteKey.on.mock.calls.find(
      ([event]) => event === 'down'
    )[1];
    const soundEffectsHandler = soundEffectsKey.on.mock.calls.find(
      ([event]) => event === 'down'
    )[1];

    muteHandler();
    soundEffectsHandler();

    expect(retroMusic.stop).toHaveBeenCalled();
    expect(soundEffects.toggle).toHaveBeenCalledTimes(1);
    expect(uiRenderer.updateAudioIndicators).toHaveBeenCalledWith(true, true);
    expect(uiRenderer.updateAudioIndicators).toHaveBeenCalledWith(true, false);
  });

  test('audio controller reacts to gameplay audio events', () => {
    scene.create();

    EventBus.emit(EVENTS.LINES_CLEARED, { rows: [0, 1] });
    EventBus.emit(EVENTS.LEVEL_UP, { level: 2 });

    expect(soundEffects.playLineClear).toHaveBeenCalledWith(2);
    expect(soundEffects.playLevelUp).toHaveBeenCalled();
  });

  test('update refreshes elapsed time and pauses active gameplay after the start guard expires', () => {
    scene.create();
    scene.stateMachine.start();
    scene.stateMachine.consumeEvents();
    scene.dropLoopController.restart(scene.gameState.dropSpeed);
    const activeTimer = scene.dropLoopController.timer;
    scene.time.now = 1000;
    jest.spyOn(scene.gameState.score, 'updateGameTime');
    jest.spyOn(scene.gameState.score, 'getGameTime').mockReturnValue(42);
    Phaser.Input.Keyboard.JustDown.mockImplementation(
      (key) => key === scene.inputController.pauseKey
    );

    scene.update();

    expect(scene.gameState.score.updateGameTime).toHaveBeenCalled();
    expect(uiRenderer.updateTime).toHaveBeenCalledWith(42);
    expect(scene.stateMachine.getState()).toBe(GAME_STATES.PAUSED);
    expect(activeTimer.paused).toBe(true);
    expect(retroMusic.pause).toHaveBeenCalled();
    expect(overlayRenderer.renderPauseScreen).toHaveBeenCalledTimes(1);
  });

  test('gameplay input delegates movement, rotation, and fast drop to game state and renderers', () => {
    scene.create();
    scene.stateMachine.start();
    scene.stateMachine.consumeEvents();
    scene.gameState.currentTetramino = { blocks: [] };
    jest.spyOn(scene.gameState, 'moveLeft').mockReturnValue(true);
    jest.spyOn(scene.gameState, 'rotate').mockReturnValue(true);
    jest.spyOn(scene.gameState, 'updateTick').mockReturnValue({
      moved: true,
      locked: false,
      spawned: false,
      gameOver: false
    });
    Phaser.Input.Keyboard.JustDown.mockImplementation(
      (key) =>
        key === scene.inputController.cursors.left ||
        key === scene.inputController.cursors.up ||
        key === scene.inputController.cursors.down
    );

    scene.update();

    expect(scene.gameState.moveLeft).toHaveBeenCalled();
    expect(scene.gameState.rotate).toHaveBeenCalled();
    expect(scene.gameState.updateTick).toHaveBeenCalled();
    expect(soundEffects.playMove).toHaveBeenCalled();
    expect(soundEffects.playRotate).toHaveBeenCalled();
    expect(boardRenderer.update).toHaveBeenCalledTimes(3);
    expect(scene.gameState.dropSpeed).toBe(FAST_DROP_SPEED);
    expect(scene.gameState.softDropActive).toBe(true);
    expect(scene.time.addEvent).toHaveBeenCalledWith(
      expect.objectContaining({ delay: FAST_DROP_SPEED })
    );
  });

  test('blocked movement and rotation show unavailable-action feedback without changing gameplay flow', () => {
    scene.create();
    scene.stateMachine.start();
    scene.stateMachine.consumeEvents();
    scene.gameState.currentTetramino = { blocks: [] };
    const emittedEvents = [];
    Object.values(EVENTS).forEach((eventName) => {
      EventBus.on(eventName, () => emittedEvents.push(eventName));
    });
    jest.spyOn(scene.gameState, 'moveLeft').mockReturnValue(false);
    jest.spyOn(scene.gameState, 'rotate').mockReturnValue(false);
    Phaser.Input.Keyboard.JustDown.mockImplementation(
      (key) =>
        key === scene.inputController.cursors.left ||
        key === scene.inputController.cursors.up
    );

    scene.update();

    expect(scene.gameState.moveLeft).toHaveBeenCalledTimes(1);
    expect(scene.gameState.rotate).toHaveBeenCalledTimes(1);
    expect(uiRenderer.showUnavailableAction).toHaveBeenCalledWith(
      'Move blocked'
    );
    expect(uiRenderer.showUnavailableAction).toHaveBeenCalledWith(
      'Rotation blocked'
    );
    expect(soundEffects.playMove).not.toHaveBeenCalled();
    expect(soundEffects.playRotate).not.toHaveBeenCalled();
    expect(emittedEvents).toEqual([]);
  });

  test('drop loop timer renders through the fall tick result wrapper', () => {
    scene.create();
    jest.spyOn(scene.gameState, 'updateTick').mockReturnValue({
      moved: false,
      locked: true,
      spawned: true,
      gameOver: false
    });

    scene.dropLoopController.restart(scene.gameState.dropSpeed);
    const timerConfig = scene.time.addEvent.mock.calls.at(-1)[0];
    timerConfig.callback();

    expect(scene.gameState.updateTick).toHaveBeenCalled();
    expect(boardRenderer.update).toHaveBeenCalled();
  });

  test('drop loop timer refreshes the preview directly when a new piece spawns', () => {
    scene.create();
    jest.spyOn(scene.gameState, 'updateTick').mockReturnValue({
      moved: false,
      locked: true,
      spawned: true,
      gameOver: false
    });

    scene.dropLoopController.restart(scene.gameState.dropSpeed);
    const timerConfig = scene.time.addEvent.mock.calls.at(-1)[0];
    timerConfig.callback();

    expect(uiRenderer.renderPreview).toHaveBeenCalledTimes(1);
  });

  test('game over stops the drop loop, saves score data, shows restart UI, and stops music', () => {
    scene.create();
    scene.stateMachine.start();
    scene.stateMachine.consumeEvents();
    scene.dropLoopController.restart(scene.gameState.dropSpeed);
    const activeTimer = scene.dropLoopController.timer;
    jest.spyOn(scene.gameState, 'getGameOverStatsSnapshot').mockReturnValue({
      score: 2500,
      lines: 4,
      level: 2,
      pieces: 10,
      tetrises: 1,
      time: 30
    });
    StorageManager.getBestScore.mockReturnValue(1000);

    EventBus.emit(EVENTS.GAME_OVER);

    expect(activeTimer.remove).toHaveBeenCalled();
    expect(scene.dropLoopController.timer).toBeNull();
    expect(scene.gameState.getGameOverStatsSnapshot).toHaveBeenCalledTimes(1);
    expect(StorageManager.getBestScore).toHaveBeenCalled();
    expect(StorageManager.saveHighScore).toHaveBeenCalledWith(
      expect.objectContaining({ score: 2500, time: 30 })
    );
    expect(StorageManager.updateStatistics).toHaveBeenCalledWith(
      expect.objectContaining({ score: 2500, time: 30 })
    );
    expect(scene.stateMachine.getState()).toBe(GAME_STATES.GAME_OVER);
    expect(overlayRenderer.renderGameOverScreen).toHaveBeenCalledWith({
      score: 2500,
      outcomeLabel: 'New best'
    });
    expect(scene.input.keyboard.addKey).toHaveBeenCalledWith(
      Phaser.Input.Keyboard.KeyCodes.R
    );
    expect(soundEffects.playGameOver).toHaveBeenCalled();
    expect(retroMusic.stop).toHaveBeenCalled();
  });

  test('game over passes prior best outcome and skips high-score save when score does not beat best', () => {
    scene.create();
    scene.stateMachine.start();
    scene.stateMachine.consumeEvents();
    jest.spyOn(scene.gameState, 'getGameOverStatsSnapshot').mockReturnValue({
      score: 800,
      lines: 2,
      level: 1,
      pieces: 5,
      tetrises: 0,
      time: 15
    });
    StorageManager.getBestScore.mockReturnValue(1200);

    EventBus.emit(EVENTS.GAME_OVER);

    expect(StorageManager.saveHighScore).not.toHaveBeenCalled();
    expect(StorageManager.updateStatistics).toHaveBeenCalledWith(
      expect.objectContaining({ score: 800, time: 15 })
    );
    expect(overlayRenderer.renderGameOverScreen).toHaveBeenCalledWith({
      score: 800,
      outcomeLabel: 'Best: 1200'
    });
  });

  test('game over captures previous best before saving so new-best label is not corrupted', () => {
    scene.create();
    scene.stateMachine.start();
    scene.stateMachine.consumeEvents();
    jest.spyOn(scene.gameState, 'getGameOverStatsSnapshot').mockReturnValue({
      score: 3000,
      lines: 8,
      level: 3,
      pieces: 20,
      tetrises: 2,
      time: 60
    });
    StorageManager.getBestScore.mockReturnValueOnce(1500).mockReturnValue(3000);

    EventBus.emit(EVENTS.GAME_OVER);

    expect(overlayRenderer.renderGameOverScreen).toHaveBeenCalledWith({
      score: 3000,
      outcomeLabel: 'New best'
    });
    expect(StorageManager.saveHighScore).toHaveBeenCalled();
  });

  test('restart clears game-over UI, resets domain state, updates UI, and uses the restart transition', () => {
    scene.create();
    scene.stateMachine.start();
    scene.stateMachine.consumeEvents();
    EventBus.emit(EVENTS.GAME_OVER);
    const restartKey = scene.inputController.restartKey;
    const restartHandler = restartKey.on.mock.calls.find(
      ([event]) => event === 'down'
    )[1];
    jest.spyOn(scene.gameState, 'reset');
    jest.spyOn(scene.stateMachine, 'restart');

    restartHandler();

    expect(overlayRenderer.clearGameOverScreen).toHaveBeenCalledTimes(1);
    expect(restartKey.removeAllListeners).toHaveBeenCalled();
    expect(scene.gameState.reset).toHaveBeenCalledTimes(1);
    expect(uiRenderer.onScoreUpdated).toHaveBeenCalledWith({
      stats: expect.objectContaining({ score: 0, level: 1 })
    });
    expect(uiRenderer.onLevelUp).toHaveBeenCalledWith({ level: 1 });
    expect(scene.stateMachine.restart).toHaveBeenCalledTimes(1);
    expect(scene.stateMachine.getState()).toBe(GAME_STATES.PLAYING);
    expect(scene.gameState.currentTetramino).toBeDefined();
    expect(scene.time.addEvent).toHaveBeenCalledWith(
      expect.objectContaining({ callback: expect.any(Function), loop: true })
    );
  });

  test('game over binds R and pointerdown restart; restart clears both', () => {
    scene.create();
    scene.stateMachine.start();
    scene.stateMachine.consumeEvents();
    scene.input.on.mockClear();
    scene.input.off.mockClear();

    EventBus.emit(EVENTS.GAME_OVER);

    expect(scene.input.keyboard.addKey).toHaveBeenCalledWith(
      Phaser.Input.Keyboard.KeyCodes.R
    );
    expect(scene.input.on).toHaveBeenCalledWith(
      'pointerdown',
      expect.any(Function)
    );

    const restartPointer = scene.input.on.mock.calls.find(
      ([event]) => event === 'pointerdown'
    )[1];
    const restartKey = scene.inputController.restartKey;
    jest.spyOn(scene.gameState, 'reset');
    jest.spyOn(scene.stateMachine, 'restart');

    restartPointer();

    expect(overlayRenderer.clearGameOverScreen).toHaveBeenCalledTimes(1);
    expect(restartKey.removeAllListeners).toHaveBeenCalled();
    expect(scene.input.off).toHaveBeenCalledWith('pointerdown', restartPointer);
    expect(scene.stateMachine.getState()).toBe(GAME_STATES.PLAYING);
  });

  test('pointer restart remains inactive outside game-over', () => {
    scene.create();
    scene.input.on.mockClear();

    scene.stateMachine.start();
    scene.stateMachine.consumeEvents();
    expect(scene.stateMachine.getState()).toBe(GAME_STATES.PLAYING);
    expect(scene.input.on).not.toHaveBeenCalledWith(
      'pointerdown',
      expect.any(Function)
    );

    scene.stateMachine.pause();
    expect(scene.stateMachine.getState()).toBe(GAME_STATES.PAUSED);
    expect(scene.inputController.restartKey).toBeFalsy();
  });

  test('Esc opens and closes settings on start without starting the game', () => {
    scene.create();
    const escHandler = scene.inputController.escKey.on.mock.calls[0][1];

    escHandler();

    expect(scene.settingsOpen).toBe(true);
    expect(overlayRenderer.renderSettingsScreen).toHaveBeenCalledWith(
      scene.preferences
    );
    expect(scene.stateMachine.getState()).toBe(GAME_STATES.START_SCREEN);

    const startTrigger = scene.input.keyboard.on.mock.calls.find(
      ([eventName]) => eventName === 'keydown'
    )[1];
    startTrigger({ keyCode: Phaser.Input.Keyboard.KeyCodes.A || 65 });
    expect(scene.stateMachine.getState()).toBe(GAME_STATES.START_SCREEN);

    escHandler();
    expect(scene.settingsOpen).toBe(false);
    expect(overlayRenderer.renderStartScreen).toHaveBeenCalled();
  });

  test('G toggles ghost preference and updates the board renderer', () => {
    scene.create();
    scene.stateMachine.start();
    scene.stateMachine.consumeEvents();
    const ghostHandler = scene.inputController.ghostKey.on.mock.calls[0][1];

    ghostHandler();

    expect(scene.preferences.ghostEnabled).toBe(false);
    expect(StorageManager.savePreferences).toHaveBeenCalledWith(
      expect.objectContaining({ ghostEnabled: false })
    );
    expect(boardRenderer.setGhostEnabled).toHaveBeenCalledWith(false);
    expect(boardRenderer.update).toHaveBeenCalled();
  });

  test('L cycles locale preference and refreshes localized UI', () => {
    scene.create();
    overlayRenderer.renderStartScreen.mockClear();
    uiRenderer.refreshLocalizedUI.mockClear();
    const localeHandler = scene.inputController.localeKey.on.mock.calls[0][1];

    localeHandler();

    expect(scene.preferences.locale).toBe('es');
    expect(StorageManager.savePreferences).toHaveBeenCalledWith(
      expect.objectContaining({ locale: 'es' })
    );
    expect(uiRenderer.refreshLocalizedUI).toHaveBeenCalled();
    expect(overlayRenderer.renderStartScreen).toHaveBeenCalled();
  });
});
