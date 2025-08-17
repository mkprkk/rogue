class Collectable extends Entity {
  constructor(name, power, field) {
    super(field, settings.collectables.zIndex);
    this.name = name;
    this.power = power;
    this.onField = true;
    this.observer = new Observer();
  }
  pickUp(player) {
    if (
      player.position.x === this.position.x &&
      player.position.y === this.position.y &&
      this.onField
    ) {
      this.apply(player);
      this.onField = false;
      this.observer.notify("pickedUp");
    }
  }
}