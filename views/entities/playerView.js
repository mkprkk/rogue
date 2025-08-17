class PlayerView extends EntityView {
  constructor(entity, cellElements, spriteClass, cols) {
    super(entity, cellElements, spriteClass, cols);
    const healthBar = document.createElement("div");
    healthBar.classList.add(sprites.health);
    this.element.append(healthBar);
    this.healthBar = healthBar;

    this.entity.observer.subscribe("getDamage", (data) => {
      this.healthView(data.health, data.maxHealth);
    });
    this.entity.observer.subscribe("die", () => {
      this.healthBar.style.display = "none";
      this.removeEntityView();
    });
    this.entity.observer.subscribe("applyHealthPotion", (data) => {
      this.healthView(data.health, data.maxHealth);
    });

    this.healthView(entity.health, entity.maxHealth);
  }

  healthView(health, maxHealth) {
    const healthPercentage = (health / maxHealth) * 100;
    this.healthBar.style.width = `${healthPercentage}%`;
  }
}