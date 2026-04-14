import Phaser from 'phaser';
import { CANVAS_WIDTH, CANVAS_HEIGHT, FAST_DROP_SPEED } from '../config/settings.js';
import { RetroMusic } from '../utils/retroMusic.js';
import { SoundEffects } from '../utils/soundEffects.js';
import { StorageManager } from '../utils/storage.js';

import EventBus, { EVENTS } from '../events/EventBus.js';
import GameState from '../logic/GameState.js';
import GameStateMachine, { GAME_STATES } from '../logic/GameStateMachine.js';

import BoardRenderer from './components/BoardRenderer.js';
import UIRenderer from './components/UIRenderer.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    this.add.rectangle(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH, CANVAS_HEIGHT, 0x34495e);
    
    this.gameState = new GameState();
    this.stateMachine = new GameStateMachine();
    
    this.boardRenderer = new BoardRenderer(this, this.gameState);
    this.uiRenderer = new UIRenderer(this, this.gameState);
    
    this.setupAudio();
    this.setupInputs();
    
    this.timeUpdateThrottle = 0;
    
    EventBus.on(EVENTS.GAME_START, this.onGameStart, this);
    EventBus.on(EVENTS.GAME_OVER, this.onGameOver, this);
    EventBus.on(EVENTS.GAME_PAUSED, this.showPauseScreen, this);
    EventBus.on(EVENTS.GAME_RESUMED, this.hidePauseScreen, this);
    
    this.showStartScreen();
  }
  
  setupAudio() {
    this.musicMuted = false;
    try {
      this.retroMusic = new RetroMusic(this);
      if (this.retroMusic.init()) this.musicStarted = false;
      else this.retroMusic = null;
    } catch (e) { this.retroMusic = null; }
    
    try {
      this.soundEffects = new SoundEffects(this);
      if (!this.soundEffects.init()) this.soundEffects = null;
    } catch (e) { this.soundEffects = null; }

    this.uiRenderer.updateAudioIndicators(this.musicMuted, this.soundEffects ? this.soundEffects.isEnabled() : false);
    
    EventBus.on(EVENTS.LINES_CLEARED, (r) => { if(this.soundEffects) this.soundEffects.playLineClear(r.length); }, this);
    EventBus.on(EVENTS.LEVEL_UP, () => { if(this.soundEffects) this.soundEffects.playLevelUp(); }, this);
    EventBus.on(EVENTS.GAME_OVER, () => { 
        if(this.soundEffects) this.soundEffects.playGameOver(); 
        if(this.retroMusic) this.retroMusic.stop();
    }, this);
  }

  setupInputs() {
    this.cursors = this.input.keyboard.createCursorKeys();
    
    this.muteKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);
    this.muteKey.on('down', () => this.toggleMusic());
    
    this.soundEffectsKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.soundEffectsKey.on('down', () => this.toggleSoundEffects());
    
    this.pauseKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    this.horizontalMoveDelay = 200;
    this.rotateDelay = 150;
  }
  
  toggleMusic() {
    this.musicMuted = !this.musicMuted;
    if (this.retroMusic) {
      if (this.musicMuted) {
        this.retroMusic.stop();
        this.musicStarted = false;
      } else if (this.stateMachine.isState(GAME_STATES.PLAYING)) {
        this.retroMusic.play();
        this.musicStarted = true;
      }
    }
    this.uiRenderer.updateAudioIndicators(this.musicMuted, this.soundEffects ? this.soundEffects.isEnabled() : false);
  }
  
  toggleSoundEffects() {
    if (this.soundEffects) {
      const enabled = this.soundEffects.toggle();
      this.uiRenderer.updateAudioIndicators(this.musicMuted, enabled);
      if (enabled) this.soundEffects.playMove();
    }
  }

  update() {
    const now = this.time.now;
    if (this.stateMachine.isState(GAME_STATES.PLAYING)) {
        if (now - this.timeUpdateThrottle >= 1000) {
            this.gameState.score.updateGameTime();
            this.uiRenderer.updateTime(this.gameState.score.getGameTime());
            this.timeUpdateThrottle = now;
        }

        if (Phaser.Input.Keyboard.JustDown(this.pauseKey) || Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            if (!this.justStarted) this.stateMachine.pause();
        }
        
        this.handleGameplayInputs();
    } else if (this.stateMachine.isState(GAME_STATES.PAUSED)) {
        if (Phaser.Input.Keyboard.JustDown(this.pauseKey) || Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            this.stateMachine.resume();
        }
    }
    
    if (this.justStarted && now > (this.startTime || 0) + 200) {
        this.justStarted = false;
    }
  }

  handleGameplayInputs() {
    if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) this.tryMove(-1);
    else if (this.cursors.left.isDown && this.canMoveHorizontally()) this.tryMove(-1);
    
    if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) this.tryMove(1);
    else if (this.cursors.right.isDown && this.canMoveHorizontally()) this.tryMove(1);
    
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up) && this.canRotate()) {
        if (this.gameState.rotate()) {
            if (this.soundEffects) this.soundEffects.playRotate();
            this.boardRenderer.update();
        }
        this.lastRotateTime = this.time.now;
    }
    
    if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
        this.gameState.updateTick();
        this.boardRenderer.update();
        if (!this.isFastDrop) {
            this.gameState.dropSpeed = FAST_DROP_SPEED;
            this.startVerticalTimer();
            this.isFastDrop = true;
        }
    } else if (Phaser.Input.Keyboard.JustUp(this.cursors.down)) {
        this.gameState.dropSpeed = this.gameState.baseDropSpeed;
        this.startVerticalTimer();
        this.isFastDrop = false;
    }
  }

  canMoveHorizontally() {
      if (!this.lastMoveTime) return true;
      return this.time.now - this.lastMoveTime > this.horizontalMoveDelay;
  }
  
  canRotate() {
      if (!this.lastRotateTime) return true;
      return this.time.now - this.lastRotateTime > this.rotateDelay;
  }

  tryMove(dir) {
      const moved = dir === -1 ? this.gameState.moveLeft() : this.gameState.moveRight();
      if (moved) {
          if (this.soundEffects) this.soundEffects.playMove();
          this.lastMoveTime = this.time.now;
          this.boardRenderer.update();
      }
  }

  onGameStart() {
      this.gameState.score.startTimer();
      this.uiRenderer.renderPreview();
      
      if (this.retroMusic && !this.musicMuted && !this.musicStarted) {
          this.retroMusic.play();
          this.musicStarted = true;
      }
      
      this.gameState.spawnTetramino();
      this.boardRenderer.update();
      this.startVerticalTimer();
  }

  startVerticalTimer() {
    if (this.verticalTimer) this.verticalTimer.remove();
    this.verticalTimer = this.time.addEvent({
      delay: this.gameState.dropSpeed,
      callback: () => {
        this.gameState.updateTick();
        this.boardRenderer.update();
      },
      loop: true
    });
  }

  showStartScreen() {
    const overlay = this.add.rectangle(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH, CANVAS_HEIGHT, 0x000000, 0.8);
    const titleText = this.add.text(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 200, 'TETRIS', { fontSize: '64px', fill: '#e74c3c', fontStyle: 'bold' }).setOrigin(0.5);
    const startText = this.add.text(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 100, 'Presiona cualquier tecla', { fontSize: '24px', fill: '#2ecc71', fontStyle: 'bold' }).setOrigin(0.5);
    this.tweens.add({ targets: startText, alpha: 0.3, duration: 800, yoyo: true, repeat: -1 });
    
    this.startUIElements = [overlay, titleText, startText];
    
    const startTrigger = (evt) => {
        if (evt && evt.keyCode === Phaser.Input.Keyboard.KeyCodes.P) return;
        this.input.keyboard.off('keydown', startTrigger);
        this.input.off('pointerdown', startTrigger);
        
        this.startUIElements.forEach(el => el.destroy());
        this.justStarted = true;
        this.startTime = this.time.now;
        this.stateMachine.start();
    };
    this.input.keyboard.on('keydown', startTrigger);
    this.input.on('pointerdown', startTrigger);
  }

  showPauseScreen() {
    if (this.verticalTimer) this.verticalTimer.paused = true;
    if (this.retroMusic) this.retroMusic.pause();
    
    const overlay = this.add.rectangle(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH, CANVAS_HEIGHT, 0x000000, 0.7);
    const text = this.add.text(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 'PAUSED', { fontSize: '64px', fill: '#f39c12', fontStyle: 'bold' }).setOrigin(0.5);
    this.pauseUIElements = [overlay, text];
  }

  hidePauseScreen() {
    if (this.verticalTimer) this.verticalTimer.paused = false;
    if (this.retroMusic) this.retroMusic.resume();
    
    if (this.pauseUIElements) {
        this.pauseUIElements.forEach(el => el.destroy());
        this.pauseUIElements = null;
    }
  }

  onGameOver() {
    if (this.verticalTimer) this.verticalTimer.remove();
    this.gameState.score.updateGameTime();
    
    const stats = this.gameState.score.getAllStats();
    if (stats.score > StorageManager.getBestScore()) {
        StorageManager.saveHighScore(stats);
    }
    StorageManager.updateStatistics(stats);
    
    const overlay = this.add.rectangle(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH, CANVAS_HEIGHT, 0x000000, 0.7);
    const text = this.add.text(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60, 'GAME OVER', { fontSize: '48px', fill: '#e74c3c', fontStyle: 'bold' }).setOrigin(0.5);
    const restartText = this.add.text(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 60, 'Press R to Restart', { fontSize: '20px', fill: '#95a5a6' }).setOrigin(0.5);
    this.gameOverUIElements = [overlay, text, restartText];
    
    this.restartKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    this.restartKey.on('down', () => this.restartGame());
  }

  restartGame() {
    if (this.gameOverUIElements) {
      this.gameOverUIElements.forEach(el => el.destroy());
      this.gameOverUIElements = null;
    }
    if (this.restartKey) {
      this.restartKey.removeAllListeners();
      this.restartKey = null;
    }
    
    this.gameState.reset();
    this.uiRenderer.onScoreUpdated(this.gameState.score.getAllStats());
    this.uiRenderer.onLevelUp(1);
    this.boardRenderer.update();
    
    if (this.retroMusic && !this.musicMuted) {
      this.retroMusic.play();
      this.musicStarted = true;
    }
    
    this.stateMachine.currentState = GAME_STATES.START_SCREEN;
    this.stateMachine.start();
  }
}
