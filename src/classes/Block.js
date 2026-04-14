export default class Block {
  constructor(logicalX, logicalY, color) {
    this.x = logicalX;
    this.y = logicalY;
    this.color = color;
  }

  // Get logical position
  getLogicalPosition() {
    return { x: this.x, y: this.y };
  }

  // Set logical position
  setLogicalPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  // Copy logical position
  getLogicalPositionCopy() {
    return { x: this.x, y: this.y };
  }
}
