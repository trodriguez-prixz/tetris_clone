import Block from './Block.js';
import { TETRAMINOS, GRID_COLS, GRID_ROWS } from '../config/settings.js';

export default class Tetramino {
  constructor(scene, type = null) {
    this.scene = scene;
    this.blocks = [];
    
    // Get random type if not provided
    const types = Object.keys(TETRAMINOS);
    this.type = type || types[Math.floor(Math.random() * types.length)];
    
    const tetraminoData = TETRAMINOS[this.type];
    this.color = tetraminoData.color;
    
    // Store original relative positions for rotation
    this.relativePositions = tetraminoData.blocks.map(pos => ({ x: pos.x, y: pos.y }));
    
    // Initial position: center top of the grid
    const startX = Math.floor(GRID_COLS / 2) - 1;
    const startY = 0;
    
    // Create blocks based on relative positions
    this.relativePositions.forEach(relativePos => {
      const logicalX = startX + relativePos.x;
      const logicalY = startY + relativePos.y;
      const block = new Block(scene, logicalX, logicalY, this.color);
      this.blocks.push(block);
    });
    
    // Pivot point (center of the tetramino, typically at startX, startY or first block)
    this.pivot = new Phaser.Math.Vector2(startX, startY);
    this.rotation = 0; // 0, 90, 180, 270 degrees
  }

  // Move tetramino down by 1
  moveDown() {
    this.blocks.forEach(block => {
      const pos = block.getLogicalPosition();
      block.setLogicalPosition(pos.x, pos.y + 1);
    });
    this.pivot.y += 1;
  }

  // Move tetramino left
  moveLeft() {
    this.blocks.forEach(block => {
      const pos = block.getLogicalPosition();
      block.setLogicalPosition(pos.x - 1, pos.y);
    });
    this.pivot.x -= 1;
  }

  // Move tetramino right
  moveRight() {
    this.blocks.forEach(block => {
      const pos = block.getLogicalPosition();
      block.setLogicalPosition(pos.x + 1, pos.y);
    });
    this.pivot.x += 1;
  }

  // Get all logical positions of blocks
  getBlockPositions() {
    return this.blocks.map(block => block.getLogicalPosition());
  }

  // Check if next horizontal move would collide with walls
  nextMoveHorizontalCollide(direction, fieldData = null) {
    const positions = this.getBlockPositions();
    
    for (const pos of positions) {
      const newX = pos.x + direction;
      
      // Wall collision
      if (newX < 0 || newX >= GRID_COLS) {
        return true;
      }
      
      // Block collision (if fieldData provided)
      if (fieldData && fieldData[pos.y] && fieldData[pos.y][newX] !== null) {
        return true;
      }
    }
    
    return false;
  }

  // Check if next vertical move would collide with floor or blocks
  nextMoveVerticalCollide(fieldData = null) {
    const positions = this.getBlockPositions();
    
    for (const pos of positions) {
      const newY = pos.y + 1;
      
      // Floor collision
      if (newY >= GRID_ROWS) {
        return true;
      }
      
      // Block collision (if fieldData provided)
      if (fieldData && fieldData[newY] && fieldData[newY][pos.x] !== null) {
        return true;
      }
    }
    
    return false;
  }

  // Rotate 90 degrees clockwise around pivot
  rotate() {
    // Rotate relative positions 90 degrees clockwise
    // Formula: (x, y) -> (y, -x)
    this.relativePositions = this.relativePositions.map(pos => ({
      x: pos.y,
      y: -pos.x
    }));
    
    // Update block positions based on new relative positions
    this.relativePositions.forEach((relativePos, index) => {
      const logicalX = Math.round(this.pivot.x + relativePos.x);
      const logicalY = Math.round(this.pivot.y + relativePos.y);
      this.blocks[index].setLogicalPosition(logicalX, logicalY);
    });
    
    this.rotation = (this.rotation + 90) % 360;
  }

  // Check if rotation would cause collision
  canRotate(fieldData = null) {
    // Calculate rotated positions
    const rotatedPositions = this.relativePositions.map(pos => ({
      x: pos.y,
      y: -pos.x
    }));
    
    // Get current block positions to exclude from collision check
    const currentPositions = new Set();
    this.blocks.forEach(block => {
      const pos = block.getLogicalPosition();
      currentPositions.add(`${pos.x},${pos.y}`);
    });
    
    // Check each rotated position
    for (const relativePos of rotatedPositions) {
      const newX = Math.round(this.pivot.x + relativePos.x);
      const newY = Math.round(this.pivot.y + relativePos.y);
      
      // Wall collision
      if (newX < 0 || newX >= GRID_COLS || newY < 0 || newY >= GRID_ROWS) {
        return false;
      }
      
      // Block collision (only check if not a current block position)
      if (fieldData && fieldData[newY] && fieldData[newY][newX] !== null) {
        const isCurrentPosition = currentPositions.has(`${newX},${newY}`);
        if (!isCurrentPosition) {
          return false;
        }
      }
    }
    
    return true;
  }

  // Destroy all blocks
  destroy() {
    this.blocks.forEach(block => block.destroy());
    this.blocks = [];
  }
}

