class HealthBuff extends Collectable {
  constructor(field, settings) {
    super(settings.name, settings.power, field);
  }
  apply(player) {
    player.health += this.power;
    this.observer.notify("applyHealthPotion");
  }
}