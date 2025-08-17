class Player extends Entity {
  constructor(health, damage, field) {
    super(field, settings.player.zIndex);
    this.health = health;
    this.maxHealth = health;
    this.damage = damage;
    this.isAlive = true;
    this.lastMoveTime = 0;
    this.moveDelay = 250;
    this.observer = new Observer();
  }

  restrictActionByDelay() {
    const currentTime = Date.now();
    if (currentTime - this.lastMoveTime < this.moveDelay) {
      return false;
    }
    this.lastMoveTime = currentTime;
    return true;
  }

  isAdjacent(player) {
    if (!player.isAlive) return false;
    const distX = Math.min(
      Math.abs(this.position.x - player.position.x),
      this.field.cols - Math.abs(this.position.x - player.position.x)
    );
    const distY = Math.min(
      Math.abs(this.position.y - player.position.y),
      this.field.rows - Math.abs(this.position.y - player.position.y)
    );
    return distX <= 1 && distY <= 1;
  }

  moveTo(direction) {
    this.placeEntity(
      this.position.x + direction.x,
      this.position.y + direction.y
    );
  }

  isAdjacentAlivePlayer(player) {
    return (
      player instanceof Player && player.isAlive && this.isAdjacent(player)
    );
  }

  attack(target) {
    if (this.isAdjacentAlivePlayer(target)) {
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
