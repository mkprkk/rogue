class SwordBuff extends Collectable {
  constructor(field, settings) {
    super(settings.name, settings.power, field);
  }
  apply(player) {
    player.damage += this.power;
    this.observer.notify("applySword");
  }
}