import Phaser from 'phaser';
import { CELL_SIZE, GAME_AREA_X, GAME_AREA_Y } from '../config/settings.js';

export default class Block extends Phaser.GameObjects.Rectangle {
  constructor(scene, logicalX, logicalY, color) {
    // Calculate pixel position from logical position
    const pixelX = GAME_AREA_X + (logicalX * CELL_SIZE) + (CELL_SIZE / 2);
    const pixelY = GAME_AREA_Y + (logicalY * CELL_SIZE) + (CELL_SIZE / 2);

    super(scene, pixelX, pixelY, CELL_SIZE - 2, CELL_SIZE - 2, color);

    // Store logical position
    this.logicalPos = new Phaser.Math.Vector2(logicalX, logicalY);

    scene.add.existing(this);
    this.setOrigin(0.5, 0.5);
  }

  // Update pixel position based on logical position
  updatePixelPosition() {
    this.x = GAME_AREA_X + (this.logicalPos.x * CELL_SIZE) + (CELL_SIZE / 2);
    this.y = GAME_AREA_Y + (this.logicalPos.y * CELL_SIZE) + (CELL_SIZE / 2);
  }

  // Set logical position and update pixel position
  setLogicalPosition(x, y) {
    this.logicalPos.set(x, y);
    this.updatePixelPosition();
  }

  // Get logical position (returns reference for performance, use getLogicalPositionCopy() if you need a copy)
  getLogicalPosition() {
    return this.logicalPos;
  }

  // Get a copy of logical position (use only when you need to modify the position)
  getLogicalPositionCopy() {
    return this.logicalPos.clone();
  }
}

