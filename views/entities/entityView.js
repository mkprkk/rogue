class EntityView {
  constructor(entity, canvasContext, spriteImage, cols, cellSize) {
    this.entity = entity;
    this.ctx = canvasContext;
    this.spriteImage = spriteImage;
    this.cols = cols;
    this.cellSize = cellSize;
    this.width = cellSize.width;
    this.height = cellSize.height;
  }

  render() {
if ((this.entity.isAlive === false) || this.entity.onField === false) return;

    const x = this.entity.position.x * this.cellSize.width;
    const y = this.entity.position.y * this.cellSize.height;

    this.ctx.drawImage(this.spriteImage, x, y, this.width, this.height);
  }
}
