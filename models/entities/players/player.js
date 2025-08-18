class Player extends Entity {
  constructor(health, damage, field, zIndex = 1, speed = 1) {
    super(field, zIndex);
    this.health = health;
    this.maxHealth = health;
    this.damage = damage;
    this.isAlive = true;
    this.speed = speed;
    this.moveAccumulator = 0;
    this.attackCooldown = 0.4;
    this.attackTimer = 0;
    this.observer = new Observer();
  }

  isAdjacent(player) {
    if (!player.isAlive) return false;
    const { distX, distY } = this.getDistance(player);
    return distX <= 1 && distY <= 1;
  }

  moveTo(direction) {
    this.placeEntity(
      this.position.x + direction.x,
      this.position.y + direction.y
    );
  }

  attack(target) {
    if (this.isAdjacent(target)) {
      target.getDamage(this.damage);
      this.observer.notify("attack", { target });
    }
  }

  getDamage(amount) {
    this.health = Math.max(0, this.health - amount);
    if (this.health <= 0) {
      this.die();
    }
    this.observer.notify("getDamage", {
      health: this.health,
      maxHealth: this.maxHealth,
    });
  }

  die() {
    this.isAlive = false;
    this.removeEntity();
    this.observer.notify("die");
  }
}
