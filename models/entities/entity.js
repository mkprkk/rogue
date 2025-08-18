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

    const cellIndex = newY * this.field.cols + newX;
    if (this.field.cells[cellIndex] === settings.map.obstacles.type) {
      return false;
    }

    const occupant = Entity.entities.find(
      (entity) =>
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

  getDistance(entity) {
    const distX = Math.min(
      Math.abs(this.position.x - entity.position.x),
      this.field.cols - Math.abs(this.position.x - entity.position.x)
    );
    const distY = Math.min(
      Math.abs(this.position.y - entity.position.y),
      this.field.rows - Math.abs(this.position.y - entity.position.y)
    );
    return { distX, distY };
  }

  followTo(entity) {
    if (!entity.isAlive) {
      this.currentDirection = { x: 0, y: 0 };
      return;
    }

    let dx = entity.position.x - this.position.x;
    let dy = entity.position.y - this.position.y;

    if (Math.abs(dx) > this.field.cols / 2) {
      dx = dx > 0 ? dx - this.field.cols : dx + this.field.cols;
    }
    if (Math.abs(dy) > this.field.rows / 2) {
      dy = dy > 0 ? dy - this.field.rows : dy + this.field.rows;
    }

    this.currentDirection = {
      x: dx !== 0 ? dx / Math.abs(dx) : 0,
      y: dy !== 0 ? dy / Math.abs(dy) : 0,
    };
  }

  handleMovement(deltaTime) {
    this.moveAccumulator += deltaTime;
    const stepInterval = 1 / this.speed;

    if (this.moveAccumulator >= stepInterval) {
      if (this.currentDirection) {
        this.moveTo(this.currentDirection);
      }
      this.moveAccumulator = 0;
    }
  }

  update() {
    if (!this.isAlive || !this.restrictActionByDelay()) return;
  }
}
