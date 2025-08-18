class Bot extends Player {
  constructor(player, field, settings) {
    super(
      settings.health,
      settings.damage,
      field,
      settings.zIndex,
      settings.speed || 2,
    );
    this.player = player;
    this.field = field;
    this.rangeVision = settings.rangeVision;
    this.currentDirection = null;
    this.attackCooldown = settings.attackCooldown;
  }

  detectPlayer(player) {
    if (!player.isAlive) return false;
    const { distX, distY } = this.getDistance(player);
    return distX <= this.rangeVision && distY <= this.rangeVision;
  }

  attackPlayer(player) {
    if (!player.isAlive) return;
    if (this.isAdjacent(player) && this.attackTimer <= 0) {
      this.attack(player);
      this.attackTimer = this.attackCooldown;
    } else {
      this.followTo(player);
    }
  }

  autoMove() {
    const dx = Math.floor(Math.random() * 3) - 1;
    const dy = Math.floor(Math.random() * 3) - 1;
    this.currentDirection = { x: dx, y: dy };
  }

// Обновленный метод update для второго примера
update(deltaTime) {
  if (!this.isAlive) return;

  if (this.attackTimer > 0) {
    this.attackTimer -= deltaTime;
  }

  if (this.detectPlayer(this.player)) {
    this.attackPlayer(this.player);
  } else {
    this.autoMove();
  }

  this.handleMovement(deltaTime);
}
}
