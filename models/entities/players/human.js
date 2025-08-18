class HumanPlayer extends Player {
  constructor(field, settings) {
    super(
      settings.health,
      settings.damage,
      field,
      settings.zIndex,
      settings.speed,
    );
    this.currentDirection = null;
    this.controlSettings = settings.controls;
    this.attackCooldown = settings.attackCooldown;
  }

  setDirection(key) {
    if (!this.isAlive) return;

    const lowerCaseKey = key.toLowerCase();

    const directions = {
      // Английская раскладка
      w: { x: 0, y: -1 },
      s: { x: 0, y: 1 },
      a: { x: -1, y: 0 },
      d: { x: 1, y: 0 },

      // Русская раскладка
      ц: { x: 0, y: -1 },
      ы: { x: 0, y: 1 },
      ф: { x: -1, y: 0 },
      в: { x: 1, y: 0 },

      // Клавиши-стрелки
      arrowup: { x: 0, y: -1 },
      arrowdown: { x: 0, y: 1 },
      arrowleft: { x: -1, y: 0 },
      arrowright: { x: 1, y: 0 },
    };

    if (directions[lowerCaseKey]) {
      if (!this.currentDirection) {
        this.justStartedMoving = true;
      }
      this.currentDirection = directions[lowerCaseKey];
    }
    if (lowerCaseKey === "stop") {
      this.currentDirection = null;
      this.justStartedMoving = false;
    }
  }

  attackKey(key) {
    if (!this.isAlive) return;
    if (key === this.controlSettings.attack && this.attackTimer <= 0) {
      const targets = Entity.entities.filter(
        (entity) => entity !== this && this.isAdjacent(entity)
      );

      targets.forEach((target) => {
        this.attack(target);
      });

      if (targets.length > 0) {
        this.attackTimer = this.attackCooldown;
      }
    }
  }

update(deltaTime) {
  if (!this.isAlive) return;

  if (this.attackTimer > 0) this.attackTimer -= deltaTime;

  if (this.currentDirection) {
    if (this.justStartedMoving) {
      this.moveTo(this.currentDirection);
      this.moveAccumulator = 0;
      this.justStartedMoving = false;
    }
    this.handleMovement(deltaTime);
  } else {
    this.moveAccumulator = 0;
  }
}
}
