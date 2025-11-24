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
    
    // Create preview
    this.createPreview();
    
    // Create first tetramino
    this.spawnTetramino();
    
    // Start vertical timer
    this.startVerticalTimer();
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
  }

  updateUI() {
    this.scoreText.setText(`Score: ${this.score.getScore()}`);
    this.levelText.setText(`Level: ${this.score.getLevel()}`);
    this.linesText.setText(`Lines: ${this.score.getLinesCleared()}`);
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
    const previewCenterX = SIDEBAR_X + SIDEBAR_WIDTH / 2;
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
      const offsetX = (previewAreaWidth - shapeWidth) / 2;
      const offsetY = (segmentHeight - shapeHeight) / 2;
      
      // Center each shape in its segment
      tetraminoData.blocks.forEach(relativePos => {
        const x = previewCenterX + offsetX + ((relativePos.x - minX) * cellSize) + (cellSize / 2);
        const y = segmentCenterY + offsetY + ((relativePos.y - minY) * cellSize) + (cellSize / 2);
        
        const block = this.add.rectangle(x, y, cellSize - 2, cellSize - 2, color);
        this.previewBlocks.push(block);
      });
    });
  }

  update() {
    if (!this.currentTetramino) return;
    
    // Handle horizontal input with throttling
    this.handleHorizontalInput();
    
    // Handle rotation input
    this.handleRotationInput();
    
    // Handle fast drop (K_DOWN)
    this.handleFastDrop();
  }

  handleFastDrop() {
    if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
      this.isFastDrop = true;
      this.dropSpeed = FAST_DROP_SPEED;
      this.startVerticalTimer();
    } else if (Phaser.Input.Keyboard.JustUp(this.cursors.down)) {
      this.isFastDrop = false;
      this.dropSpeed = this.baseDropSpeed;
      this.startVerticalTimer();
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

  spawnTetramino() {
    // Get next shape from queue
    const nextType = this.nextShapes.shift();
    this.currentTetramino = new Tetramino(this, nextType);
    
    // Add new shape to queue
    this.nextShapes.push(this.getRandomShapeType());
    
    // Update preview
    this.renderPreview();
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

