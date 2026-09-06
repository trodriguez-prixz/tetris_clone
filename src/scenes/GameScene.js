import Phaser from 'phaser';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  COLORS,
  ELAPSED_TIME_UPDATE_INTERVAL
} from '../config/settings.js';
import { StorageManager } from '../utils/storage.js';

import EventBus, { EVENTS } from '../events/EventBus.js';
import GameState from '../logic/GameState.js';
import GameStateMachine, { GAME_STATES } from '../logic/GameStateMachine.js';

import AudioController from './components/AudioController.js';
import BoardRenderer from './components/BoardRenderer.js';
import DropLoopController from './components/DropLoopController.js';
import InputController from './components/InputController.js';
import OverlayRenderer from './components/OverlayRenderer.js';
import UIRenderer from './components/UIRenderer.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    this.drawBackground();
    this.initializeGameState();
    this.initializePreferences();
    this.initializeSceneComponents();
    this.initializeGameTimeTracking();
    this.registerGameLifecycleEvents();
    this.showStartScreen();
  }

  drawBackground() {
    this.add.rectangle(
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2,
      CANVAS_WIDTH,
      CANVAS_HEIGHT,
      COLORS.BACKGROUND
    );
  }

  initializeGameState() {
    this.gameState = new GameState();
    this.stateMachine = new GameStateMachine();
  }

  initializePreferences() {
    this.preferences = StorageManager.getPreferences();
    this.settingsOpen = false;
  }

  initializeSceneComponents() {
    this.boardRenderer = new BoardRenderer(this, this.gameState);
    this.boardRenderer.setGhostEnabled(this.preferences.ghostEnabled);
    this.uiRenderer = new UIRenderer(this, this.gameState);
    this.overlayRenderer = new OverlayRenderer(this);
    this.dropLoopController = new DropLoopController(this, () =>
      this.handleFallTick()
    );

    this.setupAudio();
    this.setupInputs();
  }

  initializeGameTimeTracking() {
    this.timeUpdateThrottle = 0;
  }

  registerGameLifecycleEvents() {
    EventBus.on(EVENTS.GAME_START, this.onGameStart, this);
    EventBus.on(EVENTS.GAME_OVER, this.onGameOver, this);
    EventBus.on(EVENTS.GAME_PAUSED, this.showPauseScreen, this);
    EventBus.on(EVENTS.GAME_RESUMED, this.hidePauseScreen, this);
  }

  setupAudio() {
    this.audioController = new AudioController(this, this.uiRenderer);
    this.audioController.onPreferencesChanged = (preferences) => {
      this.preferences = { ...this.preferences, ...preferences };
      this.refreshPreferenceSurfaces();
    };
    this.audioController.setup(this.preferences);
  }

  setupInputs() {
    this.inputController = new InputController(this, {
      toggleMusic: () => this.toggleMusic(),
      toggleSoundEffects: () => this.toggleSoundEffects(),
      toggleGhost: () => this.toggleGhost(),
      toggleSettings: () => this.toggleSettings(),
      isSettingsOpen: () => this.settingsOpen,
      pause: () => this.pauseGame(),
      resume: () => this.resumeGame(),
      move: (direction) => this.tryMove(direction),
      rotate: () => this.tryRotate(),
      showUnavailableAction: (message) =>
        this.showUnavailableActionFeedback(message),
      startSoftDrop: () => this.startSoftDrop(),
      stopSoftDrop: () => this.stopSoftDrop()
    });
    this.inputController.setup();
  }

  persistPreferences() {
    StorageManager.savePreferences(this.preferences);
    this.refreshPreferenceSurfaces();
  }

  refreshPreferenceSurfaces() {
    this.boardRenderer.setGhostEnabled(this.preferences.ghostEnabled);
    if (this.settingsOpen) {
      this.overlayRenderer.renderSettingsScreen(this.preferences);
    } else if (this.stateMachine.isState(GAME_STATES.PAUSED)) {
      this.overlayRenderer.renderPauseScreen(this.preferences);
    }
  }

  toggleMusic() {
    this.audioController.toggleMusic(
      this.stateMachine.isState(GAME_STATES.PLAYING)
    );
  }

  toggleSoundEffects() {
    this.audioController.toggleSoundEffects();
  }

  toggleGhost() {
    this.preferences.ghostEnabled = !this.preferences.ghostEnabled;
    this.persistPreferences();
    if (this.stateMachine.isState(GAME_STATES.PLAYING)) {
      this.boardRenderer.update();
    }
  }

  toggleSettings() {
    const onStart = this.stateMachine.isState(GAME_STATES.START_SCREEN);
    const onPause = this.stateMachine.isState(GAME_STATES.PAUSED);
    if (!onStart && !onPause && !this.settingsOpen) return;

    if (this.settingsOpen) {
      this.closeSettings();
      return;
    }

    this.openSettings();
  }

  openSettings() {
    this.settingsOpen = true;
    if (this.stateMachine.isState(GAME_STATES.START_SCREEN)) {
      this.overlayRenderer.clearStartScreen();
    } else if (this.stateMachine.isState(GAME_STATES.PAUSED)) {
      this.overlayRenderer.clearPauseScreen();
    }
    this.overlayRenderer.renderSettingsScreen(this.preferences);
  }

  closeSettings() {
    this.settingsOpen = false;
    this.overlayRenderer.clearSettingsScreen();
    if (this.stateMachine.isState(GAME_STATES.START_SCREEN)) {
      this.overlayRenderer.renderStartScreen();
    } else if (this.stateMachine.isState(GAME_STATES.PAUSED)) {
      this.overlayRenderer.renderPauseScreen(this.preferences);
    }
  }

  update() {
    const now = this.time.now;
    this.updateElapsedTime(now);
    this.updateInputController();
  }

  updateElapsedTime(now) {
    if (this.stateMachine.isState(GAME_STATES.PLAYING)) {
      if (now - this.timeUpdateThrottle >= ELAPSED_TIME_UPDATE_INTERVAL) {
        this.gameState.score.updateGameTime();
        this.uiRenderer.updateTime(this.gameState.score.getGameTime());
        this.timeUpdateThrottle = now;
      }
    }
  }

  updateInputController() {
    this.inputController.update({
      isPlaying: this.stateMachine.isState(GAME_STATES.PLAYING),
      isPaused:
        this.stateMachine.isState(GAME_STATES.PAUSED) && !this.settingsOpen
    });
  }

  pauseGame() {
    this.stateMachine.pause();
    this.emitDomainEvents(this.stateMachine.consumeEvents());
  }

  resumeGame() {
    if (this.settingsOpen) {
      this.closeSettings();
    }
    this.stateMachine.resume();
    this.emitDomainEvents(this.stateMachine.consumeEvents());
  }

  tryMove(dir) {
    const moved =
      dir === -1 ? this.gameState.moveLeft() : this.gameState.moveRight();
    if (moved) {
      this.audioController.playMove();
      this.boardRenderer.update();
    }
    return moved;
  }

  tryRotate() {
    const rotated = this.gameState.rotate();
    if (rotated) {
      this.audioController.playRotate();
      this.boardRenderer.update();
    }
    return rotated;
  }

  showUnavailableActionFeedback(message) {
    this.uiRenderer.showUnavailableAction(message);
  }

  startSoftDrop() {
    this.handleFallTick();
    if (this.gameState.startSoftDrop()) {
      this.dropLoopController.restart(this.gameState.dropSpeed);
    }
  }

  stopSoftDrop() {
    if (this.gameState.stopSoftDrop()) {
      this.dropLoopController.restart(this.gameState.dropSpeed);
    }
  }

  handleFallTick() {
    const result = this.gameState.updateTick();
    this.emitDomainEvents(this.gameState.consumeEvents());
    if (result.moved || result.locked || result.spawned || result.gameOver) {
      this.boardRenderer.update();
    }
    if (result.spawned) {
      this.uiRenderer.renderPreview();
    }
    return result;
  }

  emitDomainEvents(events) {
    events.forEach(({ type, payload }) => EventBus.emit(type, payload));
  }

  onGameStart() {
    const startResult = this.gameState.startGame();
    this.emitDomainEvents(this.gameState.consumeEvents());
    this.uiRenderer.renderPreview();

    this.audioController.startMusic();

    if (startResult.spawned) {
      this.boardRenderer.update();
      this.dropLoopController.restart(this.gameState.dropSpeed);
    }
  }

  showStartScreen() {
    this.settingsOpen = false;
    this.overlayRenderer.clearSettingsScreen();
    this.overlayRenderer.renderStartScreen();

    this.inputController.bindStartInput(() => this.handleStartInput());
  }

  handleStartInput() {
    if (this.settingsOpen) return;
    this.inputController.clearStartInput();
    this.overlayRenderer.clearStartScreen();
    this.stateMachine.start();
    this.emitDomainEvents(this.stateMachine.consumeEvents());
  }

  showPauseScreen() {
    this.dropLoopController.pause();
    this.audioController.pauseMusic();

    this.overlayRenderer.renderPauseScreen(this.preferences);
  }

  hidePauseScreen() {
    this.dropLoopController.resume();
    this.audioController.resumeMusic();

    this.clearPauseScreen();
  }

  clearPauseScreen() {
    this.overlayRenderer.clearPauseScreen();
    this.overlayRenderer.clearSettingsScreen();
    this.settingsOpen = false;
  }

  onGameOver() {
    this.stateMachine.markGameOver();
    this.dropLoopController.stop();

    const summary = this.persistGameOverStats();
    this.showGameOverScreen(summary);
    this.bindRestartInput();
  }

  persistGameOverStats() {
    const stats = this.gameState.getGameOverStatsSnapshot();
    const previousBest = StorageManager.getBestScore();
    const isNewBest = stats.score > previousBest;

    if (isNewBest) {
      StorageManager.saveHighScore(stats);
    }
    StorageManager.updateStatistics(stats);

    return {
      score: stats.score,
      outcomeLabel: isNewBest ? 'New best' : `Best: ${previousBest}`
    };
  }

  showGameOverScreen(summary) {
    this.overlayRenderer.renderGameOverScreen(summary);
  }

  bindRestartInput() {
    this.inputController.bindRestartInput(() => this.restartGame());
  }

  restartGame() {
    this.clearGameOverScreen();
    this.clearRestartInput();
    this.resetGameForRestart();
    this.audioController.startMusic();
    this.restartPlayingState();
  }

  clearGameOverScreen() {
    this.overlayRenderer.clearGameOverScreen();
  }

  clearRestartInput() {
    this.inputController.clearRestartInput();
  }

  resetGameForRestart() {
    this.gameState.reset();
    this.uiRenderer.onScoreUpdated({
      stats: this.gameState.score.getAllStats()
    });
    this.uiRenderer.onLevelUp({ level: 1 });
    this.boardRenderer.update();
  }

  restartPlayingState() {
    this.stateMachine.restart();
    this.emitDomainEvents(this.stateMachine.consumeEvents());
  }
}
