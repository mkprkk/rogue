class Entity {
  static entities = [];

  constructor(field, zIndex = 0) {
    this.field = field;
    this.position = { x: 0, y: 0 };
    this.zIndex = zIndex;
    Entity.entities.push(this);
  }

placeEntity(x, y) {
    const newX = ((x % this.field.cols) + this.field.cols) % this.field.cols;
    const newY = ((y % this.field.rows) + this.field.rows) % this.field.rows;

    // Проверяем, является ли целевая клетка стеной
    const cellIndex = newY * this.field.cols + newX;
    if (this.field.cells[cellIndex] === settings.map.obstacles.type) {
        return false;
    }

    const occupant = Entity.entities.find(
        entity =>
            entity !== this &&
            entity.position.x === newX &&
            entity.position.y === newY
    );

    if (occupant && this.zIndex <= occupant.zIndex) {
        return false;
    }

    this.position.x = newX;
    this.position.y = newY;
    return true;
}

  removeEntity() {
    Entity.entities = Entity.entities.filter((entity) => entity !== this);
  }

  update() {
    if (!this.isAlive || !this.restrictActionByDelay()) return;
  }
}