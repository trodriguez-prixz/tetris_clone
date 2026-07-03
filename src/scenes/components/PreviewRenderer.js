import { SIDEBAR_X, SIDEBAR_Y, SIDEBAR_WIDTH, PREVIEW_AREA_HEIGHT, PADDING, TETRAMINOS, PREVIEW_CELL_SIZE, RENDERED_BLOCK_INSET } from '../../config/settings.js';
import EventBus, { EVENTS } from '../../events/EventBus.js';

const PREVIEW_SLOT_COUNT = 3;

export default class PreviewRenderer {
  constructor(scene, gameState) {
    this.scene = scene;
    this.gameState = gameState;
    this.previewBlocks = [];

    EventBus.on(EVENTS.NEXT_SHAPE_UPDATED, this.renderPreview, this);
  }

  renderPreview() {
    this.previewBlocks.forEach(block => block.destroy());
    this.previewBlocks = [];

    const previewAreaWidth = SIDEBAR_WIDTH - PADDING;
    const previewAreaLeft = SIDEBAR_X + PADDING / 2;
    const segmentHeight = (PREVIEW_AREA_HEIGHT - PADDING * 2) / PREVIEW_SLOT_COUNT;
    const cellSize = PREVIEW_CELL_SIZE;

    this.gameState.nextShapes.forEach((shapeType, index) => {
      const tetData = TETRAMINOS[shapeType];
      const segmentCenterY = SIDEBAR_Y + PADDING + (index * segmentHeight) + (segmentHeight / 2);

      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      tetData.blocks.forEach(p => {
        minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
        minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
      });

      const offsetX = (previewAreaWidth - ((maxX - minX + 1) * cellSize)) / 2;
      const offsetY = (segmentHeight - ((maxY - minY + 1) * cellSize)) / 2;

      tetData.blocks.forEach(p => {
        const x = previewAreaLeft + offsetX + ((p.x - minX) * cellSize) + (cellSize / 2);
        const y = segmentCenterY + offsetY + ((p.y - minY) * cellSize) + (cellSize / 2);
        this.previewBlocks.push(this.scene.add.rectangle(x, y, cellSize - RENDERED_BLOCK_INSET, cellSize - RENDERED_BLOCK_INSET, tetData.color));
      });
    });
  }

  destroy() {
    EventBus.off(EVENTS.NEXT_SHAPE_UPDATED, this.renderPreview, this);
    this.previewBlocks.forEach(block => block.destroy());
  }
}
