class HumanPlayer extends Player {
  constructor(field, settings) {
    super(settings.health, settings.damage, field);
    this.moveDelay = 190;
    this.currentDirection = null;
    this.controlSettings = settings.controls;
  }

  setDirection(key) {
    if (!this.isAlive) return;
    const directions = {
      ArrowUp: { x: 0, y: -1 },
      ArrowDown: { x: 0, y: 1 },
      ArrowLeft: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 },
      w: { x: 0, y: -1 }, 
      s: { x: 0, y: 1 }, 
      a: { x: -1, y: 0 },
      d: { x: 1, y: 0 },
    };
    if (directions[key]) {
      this.currentDirection = directions[key];
    }
    if (key === "stop") {
      this.currentDirection = null;
    }
  }

  attackKey(key) {
    if (
      !this.isAlive ||
      key !== this.controlSettings.attack ||
      !this.restrictActionByDelay()
    )
      return;
    const target = Entity.entities.find(
      (player) => player !== this && this.isAdjacentAlivePlayer(player)
    );
    if (target) {
      this.attack(target);
    }
  }

  update() {
    if (
      !this.isAlive ||
      !this.currentDirection ||
      !this.restrictActionByDelay()
    )
      return;
    super.moveTo(this.currentDirection);
  }
}