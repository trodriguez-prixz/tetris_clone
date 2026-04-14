import EventBus, { EVENTS } from '../events/EventBus.js';
import Tetramino from '../classes/Tetramino.js';
import Score from '../classes/Score.js';
import { GRID_ROWS, GRID_COLS, TETRAMINOS, INITIAL_DROP_SPEED, LEVEL_SPEED_MULTIPLIER } from '../config/settings.js';

export default class GameState {
  constructor() {
    this.fieldData = Array(GRID_ROWS).fill(null).map(() => Array(GRID_COLS).fill(null));
    this.currentTetramino = null;
    this.score = new Score();
    this.nextShapes = [];
    this.dropSpeed = INITIAL_DROP_SPEED;
    this.baseDropSpeed = INITIAL_DROP_SPEED;
    
    // Initialize next shapes queue (3 shapes)
    for (let i = 0; i < 3; i++) {
        this.nextShapes.push(this.getRandomShapeType());
    }
  }

  reset() {
    this.fieldData = Array(GRID_ROWS).fill(null).map(() => Array(GRID_COLS).fill(null));
    this.currentTetramino = null;
    this.score.reset();
    this.nextShapes = [];
    this.dropSpeed = INITIAL_DROP_SPEED;
    this.baseDropSpeed = INITIAL_DROP_SPEED;
    for (let i = 0; i < 3; i++) {
        this.nextShapes.push(this.getRandomShapeType());
    }
  }

  getRandomShapeType() {
    const types = Object.keys(TETRAMINOS);
    return types[Math.floor(Math.random() * types.length)];
  }

  // Core update cycle for falling piece
  updateTick() {
    if (!this.currentTetramino) return;

    if (this.currentTetramino.nextMoveVerticalCollide(this.fieldData)) {
      this.lockTetramino();
    } else {
      this.currentTetramino.moveDown();
    }
  }

  // Attempt to spawn a new shape; returns false if failure (Game Over)
  spawnTetramino() {
    const nextType = this.nextShapes.shift();
    const newTetramino = new Tetramino(nextType);
    
    // Check if it fits (Game Over condition at spawn)
    if (newTetramino.nextMoveVerticalCollide(this.fieldData)) {
        return false;
    }
    
    this.currentTetramino = newTetramino;
    this.nextShapes.push(this.getRandomShapeType());
    return true;
  }

  moveLeft() {
    if (this.currentTetramino && !this.currentTetramino.nextMoveHorizontalCollide(-1, this.fieldData)) {
      this.currentTetramino.moveLeft();
      return true;
    }
    return false;
  }

  moveRight() {
    if (this.currentTetramino && !this.currentTetramino.nextMoveHorizontalCollide(1, this.fieldData)) {
      this.currentTetramino.moveRight();
      return true;
    }
    return false;
  }

  rotate() {
    if (!this.currentTetramino || this.currentTetramino.type === 'O') return false;
    
    const wallKickOffset = this.currentTetramino.tryRotateWithWallKick(this.fieldData);
    if (wallKickOffset !== null) {
      this.currentTetramino.rotateWithOffset(wallKickOffset.x, wallKickOffset.y);
      return true;
    }
    return false;
  }

  lockTetramino() {
    if (!this.currentTetramino) return;
    
    this.score.incrementPiecesPlaced();
    const positions = this.currentTetramino.getBlockPositions();
    for (let i = 0; i < positions.length; i++) {
        const pos = positions[i];
        if (pos.y >= 0 && pos.y < GRID_ROWS && pos.x >= 0 && pos.x < GRID_COLS) {
            this.fieldData[pos.y][pos.x] = this.currentTetramino.blocks[i];
        }
    }
    
    const blocks = this.currentTetramino.blocks;
    this.currentTetramino = null;
    
    EventBus.emit(EVENTS.TETRAMINO_LOCKED, blocks);
    this.checkFinishedRows();
    
    if (!this.spawnTetramino()) {
        EventBus.emit(EVENTS.GAME_OVER);
    }
  }

  checkFinishedRows() {
    const rowsToClear = [];
    
    for (let row = GRID_ROWS - 1; row >= 0; row--) {
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
    
    if (rowsToClear.length > 0) {
      // Pass the logically cleared rows down to whoever listens
      EventBus.emit(EVENTS.LINES_CLEARED, rowsToClear);
      this.clearRowsAndApplyGravity(rowsToClear);
    }
  }

  clearRowsAndApplyGravity(rowsToClear) {
      // 1. Logically nullify those rows
      rowsToClear.forEach(row => {
          for (var col=0; col<GRID_COLS; col++){
              this.fieldData[row][col] = null;
          }
      });
      
      // 2. Cascade down blocks above the cleared rows
      rowsToClear.sort((a,b) => b-a);
      rowsToClear.forEach(clearedRow => {
          for(let row = clearedRow-1; row>=0; row--){
              for(let col = 0; col<GRID_COLS; col++){
                  if(this.fieldData[row][col] !== null) {
                      const block = this.fieldData[row][col];
                      block.setLogicalPosition(block.x, block.y + 1);
                      this.fieldData[row+1][col] = block;
                      this.fieldData[row][col] = null;
                  }
              }
          }
      });
      
      const levelIncreased = this.score.addScore(rowsToClear.length);
      EventBus.emit(EVENTS.SCORE_UPDATED, this.score.getAllStats());
      if (levelIncreased) {
          this.baseDropSpeed = Math.max(50, this.baseDropSpeed * LEVEL_SPEED_MULTIPLIER);
          this.dropSpeed = this.baseDropSpeed;
          EventBus.emit(EVENTS.LEVEL_UP, this.score.getLevel());
      }
  }
}
