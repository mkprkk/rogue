class PlayerView extends EntityView {
  constructor(entity, canvasContext, spriteImage, cols, cellSize) {
    super(entity, canvasContext, spriteImage, cols, cellSize);
    
    this.entity.observer.subscribe("getDamage", (data) => {
      this.healthView(data.health, data.maxHealth);
    });
    
    this.entity.observer.subscribe("die", () => {
      this.entity.isAlive = false;
    });
    
    this.entity.observer.subscribe("applyHealthPotion", (data) => {
      this.healthView(data.health, data.maxHealth);
    });
    
    this.healthView(entity.health, entity.maxHealth);
  }

  healthView(health, maxHealth) {
    this.currentHealth = health;
    this.maxHealth = maxHealth;
  }

  render() {
    super.render();
    
    if (!this.entity.isAlive) return;
    
    const x = this.entity.position.x * this.cellSize.width;
    const y = this.entity.position.y * this.cellSize.height;
    const healthPercentage = this.currentHealth / this.maxHealth;
    const healthWidth = this.width * healthPercentage;
    
    this.ctx.fillStyle = this.entity instanceof HumanPlayer ? '#00ff00' : '#ff0000';
    this.ctx.fillRect(x, y, healthWidth, 3);
  }
}