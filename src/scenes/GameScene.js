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
  TETRAMINOS
} from '../config/settings.js';
import Tetramino from '../classes/Tetramino.js';
import Score from '../classes/Score.js';
import { RetroMusic } from '../utils/retroMusic.js';

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
    this.gameStarted = false; // Controla si el juego ha comenzado
    
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
    this.horizontalMoveDelay = 200; // 200ms throttling
    this.rotateTimer = null;
    this.rotateDelay = 150; // 150ms throttling for rotation
    
    // Create UI
    this.createUI();
    this.updateUI();
    
    // Don't create preview until game starts
    // Preview will be created in startGame()
    
    // Initialize retro music (optional, won't break game if it fails)
    this.musicMuted = false; // Estado de silencio de la música
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
    
    // Setup mute toggle key (M key)
    this.muteKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);
    this.muteKey.on('down', () => {
      if (this.gameStarted) {
        this.toggleMusic();
      }
    });
    
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
    
    // Score text
    this.scoreText = this.add.text(uiX, scoreAreaY - 50, 'Score: 0', {
      fontSize: '20px',
      fill: '#ecf0f1',
      align: 'center'
    }).setOrigin(0.5);
    
    // Level text
    this.levelText = this.add.text(uiX, scoreAreaY - 20, 'Level: 1', {
      fontSize: '20px',
      fill: '#ecf0f1',
      align: 'center'
    }).setOrigin(0.5);
    
    // Lines text
    this.linesText = this.add.text(uiX, scoreAreaY + 10, 'Lines: 0', {
      fontSize: '20px',
      fill: '#ecf0f1',
      align: 'center'
    }).setOrigin(0.5);
    
    // Music indicator (mute/unmute)
    this.musicIndicator = this.add.text(uiX, scoreAreaY + 40, '🔊 Música: ON', {
      fontSize: '16px',
      fill: '#95a5a6',
      align: 'center'
    }).setOrigin(0.5);
    
    // Mute instruction
    this.muteInstruction = this.add.text(uiX, scoreAreaY + 65, 'Presiona M para silenciar', {
      fontSize: '12px',
      fill: '#7f8c8d',
      align: 'center'
    }).setOrigin(0.5);
  }

  updateUI() {
    this.scoreText.setText(`Score: ${this.score.getScore()}`);
    this.levelText.setText(`Level: ${this.score.getLevel()}`);
    this.linesText.setText(`Lines: ${this.score.getLinesCleared()}`);
    this.updateMusicIndicator();
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
    // Only set up if music is available and not muted
    if (!this.retroMusic || this.musicMuted) return;
    
    // Remove any existing listeners first
    if (this.musicStartHandler) {
      try {
        this.input.keyboard.off('keydown', this.musicStartHandler);
        this.input.off('pointerdown', this.musicStartHandler);
      } catch (error) {
        // Ignore errors when removing listeners
      }
    }
    
    // Start music when user presses any key for the first time (only after game starts)
    this.musicStartHandler = () => {
      try {
        // Solo iniciar si el juego ha comenzado, no está silenciada y no se ha iniciado ya
        if (this.gameStarted && !this.musicStarted && this.retroMusic && !this.musicMuted) {
          this.retroMusic.play();
          this.musicStarted = true;
          this.updateMusicIndicator();
          // Remove listeners after music starts
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
    
    // Listen for keyboard or mouse interaction
    try {
      this.input.keyboard.on('keydown', this.musicStartHandler);
      this.input.on('pointerdown', this.musicStartHandler);
    } catch (error) {
      console.warn('Error al configurar listeners de música:', error);
      this.retroMusic = null;
    }
  }

  update() {
    // Don't process input if game hasn't started or is over
    if (!this.gameStarted || this.gameOver) return;
    
    if (!this.currentTetramino) return;
    
    // Handle horizontal input with throttling
    this.handleHorizontalInput();
    
    // Handle rotation input
    this.handleRotationInput();
    
    // Handle fast drop (K_DOWN)
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
      'M : Silenciar música'
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
    const startHandler = () => {
      this.startGame();
      // Remove listeners
      this.input.keyboard.off('keydown', startHandler);
      this.input.off('pointerdown', startHandler);
    };
    
    this.input.keyboard.on('keydown', startHandler);
    this.input.on('pointerdown', startHandler);
  }

  startGame() {
    // Clean up start screen UI
    if (this.startScreenUI) {
      this.startScreenUI.overlay.destroy();
      this.startScreenUI.titleText.destroy();
      this.startScreenUI.instructionsTitle.destroy();
      this.startScreenUI.instructionTexts.forEach(text => text.destroy());
      this.startScreenUI.startText.destroy();
      this.startScreenUI = null;
    }
    
    // Mark game as started
    this.gameStarted = true;
    
    // Create preview now that game has started
    this.createPreview();
    
    // Start music on first interaction (now that game has started)
    if (this.retroMusic && !this.musicMuted) {
      this.startMusicOnInteraction();
    }
    
    // Create first tetramino
    this.spawnTetramino();
    
    // Start vertical timer
    this.startVerticalTimer();
  }

  handleFastDrop() {
    // Escenario 1: Pulsación Inicial (Activación de la Aceleración)
    // Verificación explícita: if not self.down_pressed (equivalente a !this.isFastDrop)
    // Esto asegura que la lógica solo se ejecute una vez por ciclo de pulsación/liberación
    if (Phaser.Input.Keyboard.JustDown(this.cursors.down) && !this.isFastDrop) {
      // Movimiento inmediato: La pieza se mueve inmediatamente al presionar la tecla
      if (this.currentTetramino) {
        if (this.currentTetramino.nextMoveVerticalCollide(this.fieldData)) {
          this.landTetramino();
        } else {
          this.currentTetramino.moveDown();
        }
      }
      
      // Cambio de Velocidad: Actualiza el temporizador a velocidad acelerada
      this.dropSpeed = FAST_DROP_SPEED; // 30% del tiempo normal (300ms = 30% de 1000ms)
      this.startVerticalTimer(); // Reinicia temporizador con nueva velocidad
      
      // Cambio de Estado: down_pressed de falso a verdadero
      this.isFastDrop = true;
    } 
    // Escenario 2: Pulsación Sostenida (Control de Repetición)
    // Mientras la tecla está presionada, la condición !this.isFastDrop es falsa
    // Por lo tanto, la lógica de actualización NO se ejecuta en fotogramas subsiguientes
    // La velocidad permanece en FAST_DROP_SPEED y el estado permanece en true
    
    // Escenario 3: Liberación de la Tecla (Reversión a Velocidad Normal)
    else if (Phaser.Input.Keyboard.JustUp(this.cursors.down)) {
      // Reversión de Velocidad: Revierte al valor de velocidad normal
      this.dropSpeed = this.baseDropSpeed;
      this.startVerticalTimer(); // Reinicia temporizador con velocidad normal
      
      // Restablecimiento de Estado: down_pressed de verdadero a falso
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
    
    // Add score
    const levelIncreased = this.score.addScore(rowsToClear.length);
    
    // Update speed if level increased
    if (levelIncreased) {
      this.baseDropSpeed = Math.max(50, this.baseDropSpeed * LEVEL_SPEED_MULTIPLIER);
      if (!this.isFastDrop) {
        this.dropSpeed = this.baseDropSpeed;
        this.startVerticalTimer();
      }
    }
    
    // Update UI
    this.updateUI();
    
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
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        this.fieldData[row][col] = null;
      }
    }
    
    // Rebuild field_data based on current positions
    allBlocks.forEach(block => {
      const pos = block.getLogicalPosition();
      if (pos.y >= 0 && pos.y < GRID_ROWS && pos.x >= 0 && pos.x < GRID_COLS) {
        this.fieldData[pos.y][pos.x] = block;
      }
    });
  }

  // Check if a tetramino can be placed at its initial spawn position
  canSpawnTetramino(shapeType) {
    const tetraminoData = TETRAMINOS[shapeType];
    const startX = Math.floor(GRID_COLS / 2) - 1;
    const startY = 0;
    
    // Check if all blocks of the tetramino can be placed at initial position
    for (const relativePos of tetraminoData.blocks) {
      const logicalX = startX + relativePos.x;
      const logicalY = startY + relativePos.y;
      
      // Check bounds
      if (logicalX < 0 || logicalX >= GRID_COLS || logicalY < 0 || logicalY >= GRID_ROWS) {
        return false;
      }
      
      // Check if position is already occupied
      if (this.fieldData[logicalY] && this.fieldData[logicalY][logicalX] !== null) {
        return false;
      }
    }
    
    return true;
  }

  spawnTetramino() {
    // Get next shape from queue
    const nextType = this.nextShapes.shift();
    
    // Check if the tetramino can be placed at its initial position
    if (!this.canSpawnTetramino(nextType)) {
      // Game Over: Cannot spawn new tetramino
      this.triggerGameOver();
      return;
    }
    
    // Create the tetramino
    this.currentTetramino = new Tetramino(this, nextType);
    
    // Add new shape to queue
    this.nextShapes.push(this.getRandomShapeType());
    
    // Update preview
    this.renderPreview();
  }

  triggerGameOver() {
    // Set game over state
    this.gameOver = true;
    
    // Stop retro music (safely)
    try {
      if (this.retroMusic) {
        this.retroMusic.stop();
      }
    } catch (error) {
      console.warn('Error al detener la música:', error);
    }
    
    // Stop all timers
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
    
    // Create Game Over UI
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
    
    // Remove restart key listener
    if (this.restartKey) {
      this.restartKey.removeAllListeners();
      this.restartKey = null;
    }
    
    // Reset game state
    this.gameOver = false;
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
}

