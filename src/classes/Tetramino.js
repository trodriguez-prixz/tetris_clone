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

  // Get all logical positions of blocks (returns references for performance)
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

  // Rotate 90 degrees clockwise around pivot (legacy method, uses rotateWithOffset)
  rotate() {
    this.rotateWithOffset(0, 0);
  }

  // Check if rotation would cause collision (with optional offset for wall kicks)
  canRotate(fieldData = null, offsetX = 0, offsetY = 0) {
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
    
    // Check each rotated position with offset
    for (const relativePos of rotatedPositions) {
      const newX = Math.round(this.pivot.x + relativePos.x + offsetX);
      const newY = Math.round(this.pivot.y + relativePos.y + offsetY);
      
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

  // Try to rotate with wall kick offsets
  // Returns the offset that works, or null if no rotation is possible
  tryRotateWithWallKick(fieldData = null) {
    // Standard wall kick offsets (in order of preference)
    // These are the offsets to try when normal rotation fails
    const wallKickOffsets = [
      { x: 0, y: 0 },    // Original position
      { x: -1, y: 0 },   // Left
      { x: 1, y: 0 },    // Right
      { x: 0, y: -1 },   // Up
      { x: -1, y: -1 },  // Up-left
      { x: 1, y: -1 },   // Up-right
      { x: 0, y: 1 },    // Down (less common)
      { x: -2, y: 0 },   // Two left (for I piece)
      { x: 2, y: 0 }     // Two right (for I piece)
    ];

    // For I piece, use extended wall kick offsets
    if (this.type === 'I') {
      const iOffsets = [
        { x: 0, y: 0 },
        { x: -1, y: 0 },
        { x: 1, y: 0 },
        { x: -2, y: 0 },
        { x: 2, y: 0 },
        { x: 0, y: -1 },
        { x: -1, y: -1 },
        { x: 1, y: -1 }
      ];
      for (const offset of iOffsets) {
        if (this.canRotate(fieldData, offset.x, offset.y)) {
          return offset;
        }
      }
    } else {
      // For other pieces, use standard offsets
      for (const offset of wallKickOffsets) {
        if (this.canRotate(fieldData, offset.x, offset.y)) {
          return offset;
        }
      }
    }

    return null; // No valid rotation found
  }

  // Rotate with optional offset (for wall kicks)
  rotateWithOffset(offsetX = 0, offsetY = 0) {
    // Apply offset to pivot first
    this.pivot.x += offsetX;
    this.pivot.y += offsetY;
    
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

  // Destroy all blocks
  destroy() {
    this.blocks.forEach(block => block.destroy());
    this.blocks = [];
  }
}

