import {
  SIDEBAR_X,
  SIDEBAR_Y,
  SIDEBAR_WIDTH,
  PREVIEW_AREA_HEIGHT,
  PADDING,
  TETRAMINOS,
  PREVIEW_CELL_SIZE,
  RENDERED_BLOCK_INSET,
  VISUAL_SYSTEM
} from '../../config/settings.js';

const PREVIEW_SLOT_COUNT = 3;
const PREVIEW_LABEL = 'NEXT';
const PREVIEW_LABEL_TOP_OFFSET = VISUAL_SYSTEM.spacing.md;
const PREVIEW_QUEUE_TOP_OFFSET = VISUAL_SYSTEM.spacing.xl;
const PREVIEW_SLOT_GAP = VISUAL_SYSTEM.spacing.sm;
const PREVIEW_BLOCK_SCALE_INCREASE = VISUAL_SYSTEM.spacing.xs;

export default class PreviewRenderer {
  constructor(scene, gameState) {
    this.scene = scene;
    this.gameState = gameState;
    this.previewBlocks = [];
    this.previewLabel = this.createPreviewLabel();
  }

  createPreviewLabel() {
    return this.scene.add
      .text(
        SIDEBAR_X + SIDEBAR_WIDTH / 2,
        SIDEBAR_Y + PREVIEW_LABEL_TOP_OFFSET,
        PREVIEW_LABEL,
        {
          fontFamily: VISUAL_SYSTEM.typography.fontFamily,
          fontSize: VISUAL_SYSTEM.typography.size.caption,
          fill: VISUAL_SYSTEM.palette.text.secondary,
          fontStyle: VISUAL_SYSTEM.typography.weight.emphasis,
          align: 'center'
        }
      )
      .setOrigin(0.5, 0);
  }

  renderPreview() {
    this.previewBlocks.forEach((block) => block.destroy());
    this.previewBlocks = [];

    const previewAreaWidth = SIDEBAR_WIDTH - PADDING;
    const previewAreaLeft = SIDEBAR_X + PADDING / 2;
    const queueTop = SIDEBAR_Y + PREVIEW_QUEUE_TOP_OFFSET;
    const queueHeight = PREVIEW_AREA_HEIGHT - PREVIEW_QUEUE_TOP_OFFSET - PADDING;
    const segmentHeight =
      (queueHeight - PREVIEW_SLOT_GAP * (PREVIEW_SLOT_COUNT - 1)) /
      PREVIEW_SLOT_COUNT;
    const cellSize = PREVIEW_CELL_SIZE + PREVIEW_BLOCK_SCALE_INCREASE;

    this.gameState.nextShapes.forEach((shapeType, index) => {
      const tetData = TETRAMINOS[shapeType];
      const segmentTop = queueTop + index * (segmentHeight + PREVIEW_SLOT_GAP);

      let minX = Infinity,
        maxX = -Infinity,
        minY = Infinity,
        maxY = -Infinity;
      tetData.blocks.forEach((p) => {
        minX = Math.min(minX, p.x);
        maxX = Math.max(maxX, p.x);
        minY = Math.min(minY, p.y);
        maxY = Math.max(maxY, p.y);
      });

      const offsetX = (previewAreaWidth - (maxX - minX + 1) * cellSize) / 2;
      const offsetY = (segmentHeight - (maxY - minY + 1) * cellSize) / 2;

      tetData.blocks.forEach((p) => {
        const x =
          previewAreaLeft + offsetX + (p.x - minX) * cellSize + cellSize / 2;
        const y =
          segmentTop + offsetY + (p.y - minY) * cellSize + cellSize / 2;
        const previewBlock = this.scene.add.rectangle(
          x,
          y,
          cellSize - RENDERED_BLOCK_INSET,
          cellSize - RENDERED_BLOCK_INSET,
          tetData.color
        );
        previewBlock.setStrokeStyle(
          VISUAL_SYSTEM.borders.thin,
          VISUAL_SYSTEM.palette.border.secondary,
          VISUAL_SYSTEM.borders.alpha.blockStroke
        );
        this.previewBlocks.push(previewBlock);
      });
    });
  }

  destroy() {
    this.previewBlocks.forEach((block) => block.destroy());
    this.previewLabel.destroy();
  }
}
