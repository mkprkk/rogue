class EntityView {
  constructor(entity, cellElements, spriteClass, cols) {
    this.entity = entity;
    this.cellElements = cellElements;
    this.spriteClass = spriteClass;
    this.cols = cols;
    this.element = document.createElement("div");
    this.element.classList.add(spriteClass);
    this.render();
  }

  render() {
    this.cellElements.forEach(
      (cell) => cell.contains(this.element) && cell.removeChild(this.element)
    );
    const idx = this.entity.position.y * this.cols + this.entity.position.x;
    const cell = this.cellElements[idx];
    if (cell) {
      cell.appendChild(this.element);
    }
  }

  updatePosition() {
    this.render();
  }

  removeEntityView() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}