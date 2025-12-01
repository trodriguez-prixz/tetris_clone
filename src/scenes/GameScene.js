import Phaser from 'phaser';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  GAME_AREA_X,
  GAME_AREA_Y,
  GAME_AREA_WIDTH,
  GAME_AREA_HEIGHT,
  SIDEBAR_X,
  SIDEBAR_Y,
  SIDEBAR_WIDTH,
  PREVIEW_AREA_HEIGHT,
  SCORE_AREA_HEIGHT,
  PADDING,
  INITIAL_DROP_SPEED,
  FAST_DROP_SPEED,
  LEVEL_SPEED_MULTIPLIER,
  GRID_ROWS,
  GRID_COLS,
  CELL_SIZE,
  TETRAMINOS
} from '../config/settings.js';
import Tetramino from '../classes/Tetramino.js';
import Score from '../classes/Score.js';
import { RetroMusic } from '../utils/retroMusic.js';
import { SoundEffects } from '../utils/soundEffects.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    // Draw background
    this.add.rectangle(
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2,
      CANVAS_WIDTH,
      CANVAS_HEIGHT,
      0x34495e
    );

    // Draw Game Area
    this.drawArea(
      GAME_AREA_X + GAME_AREA_WIDTH / 2,
      GAME_AREA_Y + GAME_AREA_HEIGHT / 2,
      GAME_AREA_WIDTH,
      GAME_AREA_HEIGHT,
      0x2c3e50,
      0xecf0f1
    );

    // Draw Preview Area (in sidebar)
    const previewAreaY = SIDEBAR_Y + PREVIEW_AREA_HEIGHT / 2;
    this.drawArea(
      SIDEBAR_X + SIDEBAR_WIDTH / 2,
      previewAreaY,
      SIDEBAR_WIDTH - PADDING,
      PREVIEW_AREA_HEIGHT,
      0x2c3e50,
      0xecf0f1
    );

    // Draw Score Area (in sidebar, below preview)
    const scoreAreaY = SIDEBAR_Y + PREVIEW_AREA_HEIGHT + PADDING + SCORE_AREA_HEIGHT / 2;
    this.drawArea(
      SIDEBAR_X + SIDEBAR_WIDTH / 2,
      scoreAreaY,
      SIDEBAR_WIDTH - PADDING,
      SCORE_AREA_HEIGHT,
      0x2c3e50,
      0xecf0f1
    );

    // Initialize game state
    this.currentTetramino = null;
    this.dropSpeed = INITIAL_DROP_SPEED;
    this.baseDropSpeed = INITIAL_DROP_SPEED;
    this.isFastDrop = false;
    this.gameOver = false;
    this.gameStarted = false;
    this.isPaused = false;
    this.justStarted = false; // Flag to prevent pause on first frame after start
    this.isPaused = false;
    
    // Initialize field data (20x10 grid)
    this.fieldData = Array(GRID_ROWS).fill(null).map(() => Array(GRID_COLS).fill(null));
    
    // Initialize score
    this.score = new Score();
    
    // Initialize next shapes queue (3 shapes)
    this.nextShapes = [];
    for (let i = 0; i < 3; i++) {
      this.nextShapes.push(this.getRandomShapeType());
    }
    
    // Input handling
    this.cursors = this.input.keyboard.createCursorKeys();
    this.horizontalMoveTimer = null;
    this.horizontalMoveDelay = 200;
    this.rotateTimer = null;
    this.rotateDelay = 150;
    
    // Initialize retro music (optional, won't break game if it fails)
    this.musicMuted = false;
    try {
      this.retroMusic = new RetroMusic(this);
      if (this.retroMusic.init()) {
        this.musicStarted = false;
        // Start music on first user interaction
        this.startMusicOnInteraction();
      } else {
        this.retroMusic = null;
      }
    } catch (error) {
      console.warn('No se pudo inicializar la música:', error);
      this.retroMusic = null;
    }
    
    // Initialize sound effects
    try {
      this.soundEffects = new SoundEffects(this);
      if (!this.soundEffects.init()) {
        this.soundEffects = null;
      }
    } catch (error) {
      console.warn('No se pudo inicializar los efectos de sonido:', error);
      this.soundEffects = null;
    }
    
    // Create UI (after initializing sound effects so indicator shows correct state)
    this.createUI();
    this.updateUI();
    
    // Initialize particle system
    this.initParticleSystem();
    
    // Setup mute toggle key (M key)
    this.muteKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);
    this.muteKey.on('down', () => {
      if (this.gameStarted) {
        this.toggleMusic();
      }
    });
    
    // Setup sound effects toggle key (S key)
    this.soundEffectsKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.soundEffectsKey.on('down', () => {
      if (this.gameStarted && !this.isPaused) {
        this.toggleSoundEffects();
      }
    });
    
    // Setup pause toggle keys (P key or Space) - will be checked in update()
    this.pauseKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // Show start screen with instructions
    this.showStartScreen();
  }

  getRandomShapeType() {
    const types = Object.keys(TETRAMINOS);
    return types[Math.floor(Math.random() * types.length)];
  }

  createUI() {
    const scoreAreaY = SIDEBAR_Y + PREVIEW_AREA_HEIGHT + PADDING + SCORE_AREA_HEIGHT / 2;
    const uiX = SIDEBAR_X + SIDEBAR_WIDTH / 2;
    
    // Calculate the top of the score area to ensure proper spacing
    const scoreAreaTop = SIDEBAR_Y + PREVIEW_AREA_HEIGHT + PADDING;
    
    // Title for score section - more space from top border
    this.add.text(uiX, scoreAreaTop + 15, 'STATS', {
      fontSize: '18px',
      fill: '#bdc3c7',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5);
    
    // Score text - better spacing from title
    this.scoreText = this.add.text(uiX, scoreAreaTop + 45, 'Score: 0', {
      fontSize: '20px',
      fill: '#ecf0f1',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5);
    
    // Level text - better spacing
    this.levelText = this.add.text(uiX, scoreAreaTop + 75, 'Level: 1', {
      fontSize: '20px',
      fill: '#ecf0f1',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5);
    
    // Lines text - better spacing
    this.linesText = this.add.text(uiX, scoreAreaTop + 100, 'Lines: 0', {
      fontSize: '20px',
      fill: '#ecf0f1',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5);
    
    // Calculate bottom of sidebar for positioning AUDIO section at the bottom
    const sidebarBottom = CANVAS_HEIGHT - PADDING;
    
    // Audio section positioned at the bottom of the sidebar
    // Start from bottom and work upwards
    // Mute instruction - at the very bottom with margin
    this.muteInstruction = this.add.text(uiX, sidebarBottom - 20, 'M: Música | S: Sonidos', {
      fontSize: '12px',
      fill: '#7f8c8d',
      align: 'center'
    }).setOrigin(0.5);
    
    // Sound effects indicator - above instruction
    this.soundEffectsIndicator = this.add.text(uiX, sidebarBottom - 50, '🔊 Sonidos: ON', {
      fontSize: '16px',
      fill: '#95a5a6',
      align: 'center'
    }).setOrigin(0.5);
    
    // Music indicator - above sound effects
    this.musicIndicator = this.add.text(uiX, sidebarBottom - 75, '🔊 Música: ON', {
      fontSize: '16px',
      fill: '#95a5a6',
      align: 'center'
    }).setOrigin(0.5);
    
    // Audio controls section title - above music indicator
    this.add.text(uiX, sidebarBottom - 100, 'AUDIO', {
      fontSize: '14px',
      fill: '#95a5a6',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5);
  }

  formatNumber(num) {
    // Format number with thousand separators
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  updateUI() {
    // Store old values for animation detection
    if (!this.lastScore) this.lastScore = 0;
    if (!this.lastLevel) this.lastLevel = 1;
    if (!this.lastLines) this.lastLines = 0;
    
    const newScore = this.score.getScore();
    const newLevel = this.score.getLevel();
    const newLines = this.score.getLinesCleared();
    
    // Update score with animation if changed
    if (this.scoreText) {
      this.scoreText.setText(`Score: ${this.formatNumber(newScore)}`);
      if (newScore > this.lastScore) {
        this.animateTextUpdate(this.scoreText);
      }
      this.lastScore = newScore;
    }
    
    // Update level with animation if changed
    if (this.levelText) {
      this.levelText.setText(`Level: ${newLevel}`);
      if (newLevel > this.lastLevel) {
        this.animateLevelUp(this.levelText);
      }
      this.lastLevel = newLevel;
    }
    
    // Update lines with animation if changed
    if (this.linesText) {
      this.linesText.setText(`Lines: ${this.formatNumber(newLines)}`);
      if (newLines > this.lastLines) {
        this.animateTextUpdate(this.linesText);
      }
      this.lastLines = newLines;
    }
    
    this.updateMusicIndicator();
    this.updateSoundEffectsIndicator();
  }

  animateTextUpdate(textObject) {
    // Subtle pulse animation when value changes
    this.tweens.add({
      targets: textObject,
      scaleX: 1.15,
      scaleY: 1.15,
      duration: 150,
      yoyo: true,
      ease: 'Power2'
    });
  }

  animateLevelUp(textObject) {
    // Special animation for level up
    this.tweens.add({
      targets: textObject,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 200,
      yoyo: true,
      ease: 'Power2',
      onComplete: () => {
        // Flash effect
        this.tweens.add({
          targets: textObject,
          alpha: 0.3,
          duration: 100,
          yoyo: true,
          ease: 'Power2'
        });
      }
    });
  }

  updateMusicIndicator() {
    if (this.musicIndicator) {
      if (this.musicMuted) {
        this.musicIndicator.setText('🔇 Música: OFF');
        this.musicIndicator.setFill('#e74c3c');
      } else {
        this.musicIndicator.setText('🔊 Música: ON');
        this.musicIndicator.setFill('#2ecc71');
      }
    }
  }

  updateSoundEffectsIndicator() {
    if (this.soundEffectsIndicator) {
      if (!this.soundEffects || !this.soundEffects.isEnabled()) {
        this.soundEffectsIndicator.setText('🔇 Sonidos: OFF');
        this.soundEffectsIndicator.setFill('#e74c3c');
      } else {
        this.soundEffectsIndicator.setText('🔊 Sonidos: ON');
        this.soundEffectsIndicator.setFill('#2ecc71');
      }
    }
  }

  toggleSoundEffects() {
    if (this.soundEffects) {
      const enabled = this.soundEffects.toggle();
      this.updateSoundEffectsIndicator();
      // Play a test sound when enabling
      if (enabled) {
        this.soundEffects.playMove();
      }
    }
  }

  togglePause() {
    if (this.isPaused) {
      this.resumeGame();
    } else {
      this.pauseGame();
    }
  }

  pauseGame() {
    if (this.isPaused || this.gameOver || !this.gameStarted) return;
    
    this.isPaused = true;
    
    // Pause all timers
    if (this.verticalTimer) {
      this.verticalTimer.paused = true;
    }
    if (this.horizontalMoveTimer) {
      this.horizontalMoveTimer.paused = true;
    }
    if (this.rotateTimer) {
      this.rotateTimer.paused = true;
    }
    
    // Pause music
    if (this.retroMusic) {
      this.retroMusic.pause();
    }
    
    // Show pause overlay
    this.showPauseScreen();
  }

  resumeGame() {
    if (!this.isPaused) return;
    
    this.isPaused = false;
    
    // Resume all timers
    if (this.verticalTimer) {
      this.verticalTimer.paused = false;
    }
    if (this.horizontalMoveTimer) {
      this.horizontalMoveTimer.paused = false;
    }
    if (this.rotateTimer) {
      this.rotateTimer.paused = false;
    }
    
    // Resume music
    if (this.retroMusic) {
      this.retroMusic.resume();
    }
    
    // Hide pause overlay
    this.hidePauseScreen();
  }

  showPauseScreen() {
    // Create semi-transparent overlay
    const overlay = this.add.rectangle(
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2,
      CANVAS_WIDTH,
      CANVAS_HEIGHT,
      0x000000,
      0.7
    );
    
    // Paused text
    const pausedText = this.add.text(
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2 - 30,
      'PAUSED',
      {
        fontSize: '64px',
        fill: '#f39c12',
        fontStyle: 'bold',
        align: 'center'
      }
    ).setOrigin(0.5);
    
    // Resume instruction
    const resumeText = this.add.text(
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2 + 40,
      'Press P or SPACE to Resume',
      {
        fontSize: '24px',
        fill: '#ecf0f1',
        align: 'center'
      }
    ).setOrigin(0.5);
    
    // Store UI elements for cleanup
    this.pauseUI = {
      overlay,
      pausedText,
      resumeText
    };
  }

  hidePauseScreen() {
    if (this.pauseUI) {
      this.pauseUI.overlay.destroy();
      this.pauseUI.pausedText.destroy();
      this.pauseUI.resumeText.destroy();
      this.pauseUI = null;
    }
  }

  toggleMusic() {
    this.musicMuted = !this.musicMuted;
    
    try {
      if (this.retroMusic) {
        if (this.musicMuted) {
          // Silenciar música
          this.retroMusic.stop();
          this.musicStarted = false;
        } else {
          // Activar música si no está iniciada
          if (!this.musicStarted) {
            this.retroMusic.play();
            this.musicStarted = true;
          }
        }
      }
    } catch (error) {
      console.warn('Error al cambiar estado de música:', error);
    }
    
    // Actualizar indicador visual
    this.updateMusicIndicator();
  }

  createPreview() {
    this.previewBlocks = [];
    this.renderPreview();
  }

  renderPreview() {
    // Clear previous preview blocks
    if (this.previewBlocks) {
      this.previewBlocks.forEach(block => block.destroy());
    }
    this.previewBlocks = [];
    
    const previewAreaWidth = SIDEBAR_WIDTH - PADDING;
    // Preview area is centered in sidebar, so its left edge is at SIDEBAR_X + PADDING/2
    const previewAreaLeft = SIDEBAR_X + PADDING / 2;
    const previewStartY = SIDEBAR_Y + PADDING;
    const segmentHeight = (PREVIEW_AREA_HEIGHT - PADDING * 2) / 3;
    const cellSize = 20; // Smaller cells for preview
    
    this.nextShapes.forEach((shapeType, index) => {
      const tetraminoData = TETRAMINOS[shapeType];
      const color = tetraminoData.color;
      const segmentCenterY = previewStartY + (index * segmentHeight) + (segmentHeight / 2);
      
      // Calculate bounding box of the shape to center it
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      tetraminoData.blocks.forEach(relativePos => {
        minX = Math.min(minX, relativePos.x);
        maxX = Math.max(maxX, relativePos.x);
        minY = Math.min(minY, relativePos.y);
        maxY = Math.max(maxY, relativePos.y);
      });
      
      const shapeWidth = (maxX - minX + 1) * cellSize;
      const shapeHeight = (maxY - minY + 1) * cellSize;
      // Center the shape horizontally within the preview area
      const offsetX = (previewAreaWidth - shapeWidth) / 2;
      const offsetY = (segmentHeight - shapeHeight) / 2;
      
      // Center each shape in its segment
      tetraminoData.blocks.forEach(relativePos => {
        // Calculate position relative to the left edge of preview area
        const x = previewAreaLeft + offsetX + ((relativePos.x - minX) * cellSize) + (cellSize / 2);
        const y = segmentCenterY + offsetY + ((relativePos.y - minY) * cellSize) + (cellSize / 2);
        
        const block = this.add.rectangle(x, y, cellSize - 2, cellSize - 2, color);
        this.previewBlocks.push(block);
      });
    });
  }

  startMusicOnInteraction() {
    if (!this.retroMusic || this.musicMuted) return;
    
    if (this.musicStartHandler) {
      try {
        this.input.keyboard.off('keydown', this.musicStartHandler);
        this.input.off('pointerdown', this.musicStartHandler);
      } catch (error) {}
    }
    
    this.musicStartHandler = () => {
      try {
        if (this.gameStarted && !this.musicStarted && this.retroMusic && !this.musicMuted) {
          this.retroMusic.play();
          this.musicStarted = true;
          this.updateMusicIndicator();
          if (this.musicStartHandler) {
            this.input.keyboard.off('keydown', this.musicStartHandler);
            this.input.off('pointerdown', this.musicStartHandler);
            this.musicStartHandler = null;
          }
        }
      } catch (error) {
        console.warn('Error al iniciar la música:', error);
        this.retroMusic = null;
      }
    };
    
    try {
      this.input.keyboard.on('keydown', this.musicStartHandler);
      this.input.on('pointerdown', this.musicStartHandler);
    } catch (error) {
      console.warn('Error al configurar listeners de música:', error);
      this.retroMusic = null;
    }
  }

  update() {
    if (!this.gameStarted || this.gameOver) return;
    
    // Handle pause (works even when paused to resume)
    // Space can start game, but once started it pauses/resumes
    // Don't pause on the first few frames after starting (prevents auto-pause when starting with Space)
    if (this.justStarted) {
      // Clear the flag after a few frames to allow pause
      if (this.time.now > (this.startTime || 0) + 200) {
        this.justStarted = false;
      }
    } else {
      if (Phaser.Input.Keyboard.JustDown(this.pauseKey) || Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
        this.togglePause();
      }
    }
    
    if (this.isPaused || !this.currentTetramino) return;
    
    this.handleHorizontalInput();
    this.handleRotationInput();
    this.handleFastDrop();
  }

  showStartScreen() {
    // Create semi-transparent overlay
    const overlay = this.add.rectangle(
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2,
      CANVAS_WIDTH,
      CANVAS_HEIGHT,
      0x000000,
      0.8
    );
    
    // Title
    const titleText = this.add.text(
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2 - 200,
      'TETRIS',
      {
        fontSize: '64px',
        fill: '#e74c3c',
        fontStyle: 'bold',
        align: 'center'
      }
    ).setOrigin(0.5);
    
    // Instructions title
    const instructionsTitle = this.add.text(
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2 - 120,
      'Instrucciones',
      {
        fontSize: '32px',
        fill: '#ecf0f1',
        fontStyle: 'bold',
        align: 'center'
      }
    ).setOrigin(0.5);
    
    // Instructions
    const instructions = [
      '← → : Mover pieza',
      '↑ : Rotar pieza',
      '↓ : Acelerar caída',
      'P/Espacio : Pausar',
      'M : Silenciar música',
      'S : Silenciar sonidos'
    ];
    
    const instructionTexts = [];
    instructions.forEach((instruction, index) => {
      const text = this.add.text(
        CANVAS_WIDTH / 2,
        CANVAS_HEIGHT / 2 - 60 + (index * 35),
        instruction,
        {
          fontSize: '20px',
          fill: '#bdc3c7',
          align: 'center'
        }
      ).setOrigin(0.5);
      instructionTexts.push(text);
    });
    
    // Start instruction
    const startText = this.add.text(
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2 + 100,
      'Presiona cualquier tecla para comenzar',
      {
        fontSize: '24px',
        fill: '#2ecc71',
        fontStyle: 'bold',
        align: 'center'
      }
    ).setOrigin(0.5);
    
    // Blinking animation for start text
    this.tweens.add({
      targets: startText,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1
    });
    
    // Store UI elements for cleanup
    this.startScreenUI = {
      overlay,
      titleText,
      instructionsTitle,
      instructionTexts,
      startText
    };
    
    // Listen for any key or click to start
    // Note: Space can start the game, but once started, Space will pause/resume
    const startHandler = (event) => {
      // Only block P key from starting (P is only for pause)
      if (event && event.keyCode !== undefined) {
        const keyCode = event.keyCode;
        if (keyCode === Phaser.Input.Keyboard.KeyCodes.P) {
          return;
        }
      }
      
      // Remove listeners BEFORE starting game to prevent update() from processing the same key
      if (this.startGameHandler) {
        this.input.keyboard.off('keydown', this.startGameHandler);
        this.input.off('pointerdown', this.startGameHandler);
        this.startGameHandler = null;
      }
      
      // Use a small delay to ensure the key event is consumed before update() processes it
      this.time.delayedCall(50, () => {
        this.startGame();
      });
    };
    
    this.startGameHandler = startHandler;
    this.input.keyboard.on('keydown', startHandler);
    this.input.on('pointerdown', startHandler);
  }

  startGame() {
    if (this.startScreenUI) {
      this.startScreenUI.overlay.destroy();
      this.startScreenUI.titleText.destroy();
      this.startScreenUI.instructionsTitle.destroy();
      this.startScreenUI.instructionTexts.forEach(text => text.destroy());
      this.startScreenUI.startText.destroy();
      this.startScreenUI = null;
    }
    
    // Remove start game handler (in case it wasn't removed in the handler)
    if (this.startGameHandler) {
      this.input.keyboard.off('keydown', this.startGameHandler);
      this.input.off('pointerdown', this.startGameHandler);
      this.startGameHandler = null;
    }
    
    this.gameStarted = true;
    this.isPaused = false;
    this.justStarted = true; // Set flag to prevent pause on first frame
    this.startTime = this.time.now; // Record start time for delay check
    this.createPreview();
    
    if (this.retroMusic && !this.musicMuted) {
      this.startMusicOnInteraction();
    }
    
    this.spawnTetramino();
    this.startVerticalTimer();
  }

  handleFastDrop() {
      if (Phaser.Input.Keyboard.JustDown(this.cursors.down) && !this.isFastDrop) {
      if (this.currentTetramino) {
        if (this.currentTetramino.nextMoveVerticalCollide(this.fieldData)) {
          this.landTetramino();
        } else {
          this.currentTetramino.moveDown();
          // Play move sound for automatic drop
          if (this.soundEffects && !this.isFastDrop) {
            // Only play soft sound for automatic drops, not for fast drop
          }
        }
      }
        
        this.dropSpeed = FAST_DROP_SPEED;
        this.startVerticalTimer();
        this.isFastDrop = true;
      } else if (Phaser.Input.Keyboard.JustUp(this.cursors.down)) {
        this.dropSpeed = this.baseDropSpeed;
        this.startVerticalTimer();
        this.isFastDrop = false;
      }
  }

  handleHorizontalInput() {
    // Left arrow
    if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
      this.tryMoveHorizontal(-1);
      this.startHorizontalTimer(-1);
    } else if (this.cursors.left.isDown && (!this.horizontalMoveTimer || !this.horizontalMoveTimer.getProgress())) {
      this.tryMoveHorizontal(-1);
      this.startHorizontalTimer(-1);
    }
    
    // Right arrow
    if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
      this.tryMoveHorizontal(1);
      this.startHorizontalTimer(1);
    } else if (this.cursors.right.isDown && (!this.horizontalMoveTimer || !this.horizontalMoveTimer.getProgress())) {
      this.tryMoveHorizontal(1);
      this.startHorizontalTimer(1);
    }
  }

  startHorizontalTimer(direction) {
    if (this.horizontalMoveTimer) {
      this.horizontalMoveTimer.remove();
    }
    
    this.horizontalMoveTimer = this.time.addEvent({
      delay: this.horizontalMoveDelay,
      callback: () => {
        if (this.cursors.left.isDown && direction === -1) {
          this.tryMoveHorizontal(-1);
          this.startHorizontalTimer(-1);
        } else if (this.cursors.right.isDown && direction === 1) {
          this.tryMoveHorizontal(1);
          this.startHorizontalTimer(1);
        }
      },
      loop: false
    });
  }

  tryMoveHorizontal(direction) {
    if (!this.currentTetramino) return;
    
    if (!this.currentTetramino.nextMoveHorizontalCollide(direction, this.fieldData)) {
      if (direction === -1) {
        this.currentTetramino.moveLeft();
      } else {
        this.currentTetramino.moveRight();
      }
      // Play move sound
      if (this.soundEffects) {
        this.soundEffects.playMove();
      }
    }
  }

  handleRotationInput() {
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      this.tryRotate();
    }
  }

  tryRotate() {
    if (!this.currentTetramino) return;
    
    // Check if rotation timer is active
    if (this.rotateTimer && this.rotateTimer.getProgress() < 1) {
      return;
    }
    
    if (this.currentTetramino.canRotate(this.fieldData)) {
      this.currentTetramino.rotate();
      
      // Play rotate sound
      if (this.soundEffects) {
        this.soundEffects.playRotate();
      }
      
      // Start rotation timer
      if (this.rotateTimer) {
        this.rotateTimer.remove();
      }
      this.rotateTimer = this.time.addEvent({
        delay: this.rotateDelay,
        callback: () => {},
        loop: false
      });
    }
  }

  startVerticalTimer() {
    if (this.verticalTimer) {
      this.verticalTimer.remove();
    }
    
    this.verticalTimer = this.time.addEvent({
      delay: this.dropSpeed,
      callback: () => {
        if (this.currentTetramino) {
          if (this.currentTetramino.nextMoveVerticalCollide(this.fieldData)) {
            // Tetramino has landed
            this.landTetramino();
          } else {
            this.currentTetramino.moveDown();
          }
        }
      },
      loop: true
    });
  }

  landTetramino() {
    if (!this.currentTetramino) return;
    
    // Store blocks in field_data
    const positions = this.currentTetramino.getBlockPositions();
    positions.forEach(pos => {
      if (pos.y >= 0 && pos.y < GRID_ROWS && pos.x >= 0 && pos.x < GRID_COLS) {
        this.fieldData[pos.y][pos.x] = this.currentTetramino.blocks.find(
          block => {
            const blockPos = block.getLogicalPosition();
            return blockPos.x === pos.x && blockPos.y === pos.y;
          }
        );
      }
    });
    
    // Destroy current tetramino (blocks are now in field_data)
    this.currentTetramino.blocks = [];
    this.currentTetramino = null;
    
    // Check and clear finished rows
    this.checkFinishedRows();
    
    // Spawn new tetramino
    this.spawnTetramino();
  }

  checkFinishedRows() {
    const rowsToClear = [];
    
    // Identify complete rows
    for (let row = 0; row < GRID_ROWS; row++) {
      let isComplete = true;
      for (let col = 0; col < GRID_COLS; col++) {
        if (this.fieldData[row][col] === null) {
          isComplete = false;
          break;
        }
      }
      if (isComplete) {
        rowsToClear.push(row);
      }
    }
    
    if (rowsToClear.length === 0) return;
    
    // Play line clear sound
    if (this.soundEffects) {
      this.soundEffects.playLineClear(rowsToClear.length);
    }
    
    // Animate lines before clearing
    this.animateLineClear(rowsToClear);
    
  }

  // Check if a tetramino can be placed at its initial spawn position
  canSpawnTetramino(shapeType) {
    const tetraminoData = TETRAMINOS[shapeType];
    const startX = Math.floor(GRID_COLS / 2) - 1;
    const startY = 0;
    
    for (const relativePos of tetraminoData.blocks) {
      const logicalX = startX + relativePos.x;
      const logicalY = startY + relativePos.y;
      
      if (logicalX < 0 || logicalX >= GRID_COLS || logicalY < 0 || logicalY >= GRID_ROWS) {
        return false;
      }
      
      if (this.fieldData[logicalY] && this.fieldData[logicalY][logicalX] !== null) {
        return false;
      }
    }
    
    return true;
  }

  spawnTetramino() {
    const nextType = this.nextShapes.shift();
    
    if (!this.canSpawnTetramino(nextType)) {
      this.triggerGameOver();
      return;
    }
    
    this.currentTetramino = new Tetramino(this, nextType);
    this.nextShapes.push(this.getRandomShapeType());
    this.renderPreview();
  }

  triggerGameOver() {
    this.gameOver = true;
    
    // Play game over sound
    if (this.soundEffects) {
      this.soundEffects.playGameOver();
    }
    
    try {
      if (this.retroMusic) {
        this.retroMusic.stop();
      }
    } catch (error) {
      console.warn('Error al detener la música:', error);
    }
    
    if (this.verticalTimer) {
      this.verticalTimer.remove();
      this.verticalTimer = null;
    }
    if (this.horizontalMoveTimer) {
      this.horizontalMoveTimer.remove();
      this.horizontalMoveTimer = null;
    }
    if (this.rotateTimer) {
      this.rotateTimer.remove();
      this.rotateTimer = null;
    }
    
    this.showGameOver();
  }

  showGameOver() {
    // Create semi-transparent overlay
    const overlay = this.add.rectangle(
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2,
      CANVAS_WIDTH,
      CANVAS_HEIGHT,
      0x000000,
      0.7
    );
    
    // Game Over text
    const gameOverText = this.add.text(
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2 - 60,
      'GAME OVER',
      {
        fontSize: '48px',
        fill: '#e74c3c',
        fontStyle: 'bold',
        align: 'center'
      }
    ).setOrigin(0.5);
    
    // Final score text
    const finalScoreText = this.add.text(
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2,
      `Final Score: ${this.score.getScore()}`,
      {
        fontSize: '24px',
        fill: '#ecf0f1',
        align: 'center'
      }
    ).setOrigin(0.5);
    
    // Restart instruction
    const restartText = this.add.text(
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2 + 60,
      'Press R to Restart',
      {
        fontSize: '20px',
        fill: '#95a5a6',
        align: 'center'
      }
    ).setOrigin(0.5);
    
    // Store UI elements for cleanup
    this.gameOverUI = {
      overlay,
      gameOverText,
      finalScoreText,
      restartText
    };
    
    // Listen for restart key
    this.restartKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    this.restartKey.on('down', () => {
      this.restartGame();
    });
  }

  restartGame() {
    // Clean up current game
    if (this.currentTetramino) {
      this.currentTetramino.destroy();
      this.currentTetramino = null;
    }
    
    // Clear all blocks from field
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        if (this.fieldData[row][col] !== null) {
          this.fieldData[row][col].destroy();
          this.fieldData[row][col] = null;
        }
      }
    }
    
    // Clean up Game Over UI
    if (this.gameOverUI) {
      this.gameOverUI.overlay.destroy();
      this.gameOverUI.gameOverText.destroy();
      this.gameOverUI.finalScoreText.destroy();
      this.gameOverUI.restartText.destroy();
      this.gameOverUI = null;
    }
    
    // Clean up pause UI if exists
    this.hidePauseScreen();
    
    // Remove restart key listener
    if (this.restartKey) {
      this.restartKey.removeAllListeners();
      this.restartKey = null;
    }
    
    // Reset game state
    this.gameOver = false;
    this.isPaused = false;
    this.justStarted = true; // Set flag to prevent pause on first frame after restart
    this.gameStarted = true; // Keep game started after restart
    this.dropSpeed = INITIAL_DROP_SPEED;
    this.baseDropSpeed = INITIAL_DROP_SPEED;
    this.isFastDrop = false;
    
    // Reset score
    this.score = new Score();
    
    // Reset next shapes queue
    this.nextShapes = [];
    for (let i = 0; i < 3; i++) {
      this.nextShapes.push(this.getRandomShapeType());
    }
    
    // Update UI
    this.updateUI();
    this.renderPreview();
    
    // Restart retro music (safely) - respetar estado de mute
    try {
      if (this.retroMusic) {
        this.retroMusic.stop();
        this.musicStarted = false;
        // Solo iniciar música si no está silenciada
        if (!this.musicMuted) {
          this.startMusicOnInteraction();
        }
      }
    } catch (error) {
      console.warn('Error al reiniciar la música:', error);
      this.retroMusic = null;
    }
    
    // Actualizar indicador de música
    this.updateMusicIndicator();
    
    // Spawn new tetramino
    this.spawnTetramino();
    
    // Start vertical timer
    this.startVerticalTimer();
  }

  drawArea(centerX, centerY, width, height, fillColor, strokeColor) {
    // Fill rectangle
    this.add.rectangle(centerX, centerY, width, height, fillColor);
    
    // Stroke rectangle
    const graphics = this.add.graphics();
    graphics.lineStyle(2, strokeColor, 1);
    graphics.strokeRect(
      centerX - width / 2,
      centerY - height / 2,
      width,
      height
    );
  }

  initParticleSystem() {
    // Create particle manager for line clear effects
    // We'll create particles dynamically when needed
    this.particleManagers = [];
  }

  createLineClearParticles(row, linesCleared) {
    // Calculate the Y position of the row in pixels
    const rowY = GAME_AREA_Y + (row * CELL_SIZE) + (CELL_SIZE / 2);
    
    // Determine particle properties based on number of lines cleared
    let particleCount, colors, speed, scale;
    
    if (linesCleared === 1) {
      particleCount = 20;
      colors = [0x3498db, 0x2980b9]; // Blue shades
      speed = { min: 50, max: 150 };
      scale = { start: 0.5, end: 0 };
    } else if (linesCleared === 2) {
      particleCount = 30;
      colors = [0x2ecc71, 0x27ae60]; // Green shades
      speed = { min: 80, max: 200 };
      scale = { start: 0.6, end: 0 };
    } else if (linesCleared === 3) {
      particleCount = 40;
      colors = [0xf39c12, 0xe67e22]; // Orange shades
      speed = { min: 100, max: 250 };
      scale = { start: 0.7, end: 0 };
    } else { // 4 lines - TETRIS!
      particleCount = 60;
      colors = [0xe74c3c, 0xc0392b, 0xf1c40f, 0xf39c12]; // Red, yellow, orange
      speed = { min: 150, max: 300 };
      scale = { start: 0.8, end: 0 };
    }
    
    // Create particles for each column in the cleared row
    for (let col = 0; col < GRID_COLS; col++) {
      const colX = GAME_AREA_X + (col * CELL_SIZE) + (CELL_SIZE / 2);
      
      // Create multiple particles per block
      const particlesPerBlock = Math.floor(particleCount / GRID_COLS);
      
      for (let i = 0; i < particlesPerBlock; i++) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        const angle = (Math.random() * Math.PI * 2); // Random direction
        const velocity = speed.min + Math.random() * (speed.max - speed.min);
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;
        
        // Create a simple particle using a rectangle
        const particle = this.add.rectangle(
          colX + (Math.random() - 0.5) * CELL_SIZE,
          rowY + (Math.random() - 0.5) * CELL_SIZE,
          CELL_SIZE * 0.3,
          CELL_SIZE * 0.3,
          color
        );
        
        // Animate particle
        this.tweens.add({
          targets: particle,
          x: particle.x + vx * 0.5,
          y: particle.y + vy * 0.5,
          alpha: { from: 1, to: 0 },
          scale: { from: scale.start, to: scale.end },
          duration: 500 + Math.random() * 300,
          ease: 'Power2',
          onComplete: () => {
            particle.destroy();
          }
        });
      }
    }
    
    // Add extra burst effect for Tetris (4 lines)
    if (linesCleared === 4) {
      const centerX = GAME_AREA_X + (GAME_AREA_WIDTH / 2);
      const centerY = rowY;
      
      // Create a burst of particles from the center
      for (let i = 0; i < 30; i++) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        const angle = (Math.PI * 2 * i) / 30;
        const velocity = 200 + Math.random() * 100;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;
        
        const particle = this.add.rectangle(
          centerX,
          centerY,
          CELL_SIZE * 0.4,
          CELL_SIZE * 0.4,
          color
        );
        
        this.tweens.add({
          targets: particle,
          x: particle.x + vx * 0.8,
          y: particle.y + vy * 0.8,
          alpha: { from: 1, to: 0 },
          scale: { from: 1, to: 0 },
          rotation: Math.PI * 2,
          duration: 800,
          ease: 'Power2',
          onComplete: () => {
            particle.destroy();
          }
        });
      }
    }
  }

  animateLineClear(rowsToClear) {
    // Collect all blocks in rows to clear
    const blocksToAnimate = [];
    rowsToClear.forEach(row => {
      for (let col = 0; col < GRID_COLS; col++) {
        if (this.fieldData[row][col]) {
          blocksToAnimate.push(this.fieldData[row][col]);
        }
      }
    });
    
    if (blocksToAnimate.length === 0) return;
    
    // Create flash effect overlay for each row
    const flashOverlays = [];
    rowsToClear.forEach(row => {
      const rowY = GAME_AREA_Y + (row * CELL_SIZE) + (CELL_SIZE / 2);
      const overlay = this.add.rectangle(
        GAME_AREA_X + (GAME_AREA_WIDTH / 2),
        rowY,
        GAME_AREA_WIDTH,
        CELL_SIZE,
        0xffffff,
        0
      );
      flashOverlays.push(overlay);
    });
    
    // Flash animation: blink white 3 times
    let flashCount = 0;
    const maxFlashes = 3;
    const flashDuration = 100; // ms per flash
    
    const flashAnimation = () => {
      flashOverlays.forEach(overlay => {
        overlay.setAlpha(flashCount % 2 === 0 ? 0.5 : 0);
      });
      
      flashCount++;
      if (flashCount < maxFlashes * 2) {
        this.time.delayedCall(flashDuration, flashAnimation);
      } else {
        // After flash, fade out blocks
        flashOverlays.forEach(overlay => overlay.destroy());
        this.fadeOutBlocks(blocksToAnimate, rowsToClear);
      }
    };
    
    // Start flash animation
    flashAnimation();
  }

  fadeOutBlocks(blocks, rowsToClear) {
    // Fade out all blocks in the rows
    const fadeTweens = blocks.map(block => {
      return this.tweens.add({
        targets: block,
        alpha: { from: 1, to: 0 },
        scale: { from: 1, to: 0.5 },
        duration: 200,
        ease: 'Power2'
      });
    });
    
    // After fade out, clear rows and apply gravity
    this.time.delayedCall(200, () => {
      // Add score
      const levelIncreased = this.score.addScore(rowsToClear.length);
      
      // Update speed if level increased
      if (levelIncreased) {
        // Play level up sound
        if (this.soundEffects) {
          this.soundEffects.playLevelUp();
        }
        this.baseDropSpeed = Math.max(50, this.baseDropSpeed * LEVEL_SPEED_MULTIPLIER);
        if (!this.isFastDrop) {
          this.dropSpeed = this.baseDropSpeed;
          this.startVerticalTimer();
        }
      }
      
      // Update UI
      this.updateUI();
      
      // Create particle effects before removing blocks
      rowsToClear.forEach(row => {
        this.createLineClearParticles(row, rowsToClear.length);
      });
      
      // Remove blocks from complete rows
      rowsToClear.forEach(row => {
        for (let col = 0; col < GRID_COLS; col++) {
          if (this.fieldData[row][col]) {
            this.fieldData[row][col].destroy();
            this.fieldData[row][col] = null;
          }
        }
      });
      
      // Apply gravity: move blocks above cleared rows down
      // Sort rows to clear from bottom to top
      rowsToClear.sort((a, b) => b - a);
      
      rowsToClear.forEach(clearedRow => {
        // Move all blocks above this row down by 1
        for (let row = clearedRow - 1; row >= 0; row--) {
          for (let col = 0; col < GRID_COLS; col++) {
            if (this.fieldData[row][col] !== null) {
              const block = this.fieldData[row][col];
              const pos = block.getLogicalPosition();
              
              // Move block down
              block.setLogicalPosition(pos.x, pos.y + 1);
            }
          }
        }
      });
      
      // Rebuild field_data from scratch based on current block positions
      // First, collect all blocks before clearing
      const allBlocks = [];
      for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLS; col++) {
          if (this.fieldData[row][col] !== null) {
            allBlocks.push(this.fieldData[row][col]);
          }
        }
      }
      
      // Clear field_data
      this.fieldData = Array(GRID_ROWS).fill(null).map(() => Array(GRID_COLS).fill(null));
      
      // Rebuild field_data from block positions
      allBlocks.forEach(block => {
        const pos = block.getLogicalPosition();
        if (pos.y >= 0 && pos.y < GRID_ROWS && pos.x >= 0 && pos.x < GRID_COLS) {
          this.fieldData[pos.y][pos.x] = block;
        }
      });
      
      // Render preview
      this.renderPreview();
    });
  }
}

