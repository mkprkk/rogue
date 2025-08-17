class Bot extends Player {
  constructor(player, field, settings) {
    super(settings.health, settings.damage, field);
    this.player = player;
    this.field = field;
    this.moveDelay = 700;
    this.rangeVision = settings.rangeVision;
  }

  detectPlayer(player) {
    if (!player.isAlive) return false;
    this.moveDelay = 250;

    const distX = Math.min(
      Math.abs(this.position.x - player.position.x),
      this.field.cols - Math.abs(this.position.x - player.position.x)
    );
    const distY = Math.min(
      Math.abs(this.position.y - player.position.y),
      this.field.rows - Math.abs(this.position.y - player.position.y)
    );

    return distX <= this.rangeVision && distY <= this.rangeVision;
  }

  attackPlayer(player) {
    if (!player.isAlive) return;
    if (this.isAdjacent(player)) {
      this.attack(player);
    } else {
      let dx = player.position.x - this.position.x;
      let dy = player.position.y - this.position.y;

      if (Math.abs(dx) > this.field.cols / 2) {
        dx = dx > 0 ? dx - this.field.cols : dx + this.field.cols;
      }
      if (Math.abs(dy) > this.field.rows / 2) {
        dy = dy > 0 ? dy - this.field.rows : dy + this.field.rows;
      }

      const moveX = dx !== 0 ? dx / Math.abs(dx) : 0;
      const moveY = dy !== 0 ? dy / Math.abs(dy) : 0;
      this.moveTo({ x: moveX, y: moveY });
    }
  }

  autoMove() {
    this.moveDelay = 700;
    const dx = Math.floor(Math.random() * 3) - 1;
    const dy = Math.floor(Math.random() * 3) - 1;
    this.moveTo({ x: dx, y: dy });
  }

  update() {
    if (!this.isAlive || !this.restrictActionByDelay()) return;
    if (this.detectPlayer(this.player)) {
      this.attackPlayer(this.player);
    } else {
      this.autoMove();
    }
  }
}