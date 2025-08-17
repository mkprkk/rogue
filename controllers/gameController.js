class GameController {
  constructor(settings) {
    this.settingsPlayer = settings.player;
    this.settingsBot = settings.bots;
    this.settingsMap = settings.map;
    this.settingsCollectables = settings.collectables;

    this.field = new this.settingsMap.field.class(this.settingsMap, this.settingsMap.obstacles.class);

    this.player = new this.settingsPlayer.class(
      this.field,
      this.settingsPlayer
    );
    this.placeRandomly(this.player);

    this.bots = [];
    this.createBots(this.settingsBot.amount);

    this.collectables = [];
    this.createCollectables(this.settingsCollectables);

    this.gameState = new GameState();
    this.eventManager = new Observer();
    this.eventManager.subscribe("die", () => this.checkWinCondition());

    document.addEventListener("keydown", (e) => {
      e.preventDefault();
      this.player.setDirection(e.key);
      this.player.attackKey(e.key);
    });
    document.addEventListener("keyup", (e) => {
      e.preventDefault();
      if (
        this.settingsPlayer.controls.move.includes(e.key) ||
        this.settingsPlayer.controls.move.includes(e.key.toLowerCase())
      ) {
        this.player.setDirection("stop");
      }
    });

    this.gameLoop = this.gameLoop.bind(this);
  }

  placeRandomly(entity) {
    const x = Math.floor(Math.random() * this.field.cols);
    const y = Math.floor(Math.random() * this.field.rows);
    entity.placeEntity(x, y);
  }

  createBots(count) {
    for (let i = 0; i < count; i++) {
      const bot = new this.settingsBot.class(
        this.player,
        this.field,
        this.settingsBot
      );
      this.placeRandomly(bot);
      this.bots.push(bot);
    }
  }

  createCollectables(collectablesSettings) {
    Object.entries(collectablesSettings).forEach(([name, cfg]) => {
      if (name === "zIndex") return;
      for (let i = 0; i < cfg.amount; i++) {
        const collectable = new cfg.class(this.field, cfg);
        this.placeRandomly(collectable);

        collectable.observer.subscribe("applyHealthPotion", () => {
          this.player.observer.notify("applyHealthPotion", {
            health: this.player.health,
            maxHealth: this.player.maxHealth,
          });
        });

        this.collectables.push(collectable);
      }
    });
  }

  update() {
    if (!this.player.isAlive) return;
    this.player.update();
    this.bots.forEach((bot) => bot.isAlive && bot.update());

    this.collectables = this.collectables.filter((c) => {
      if (c.onField) {
        c.pickUp(this.player);
        return c.onField;
      }
      return false;
    });

    this.checkWinCondition();
  }

  checkWinCondition() {
    const allBotsDead = this.bots.every((bot) => !bot.isAlive);
    if (allBotsDead) {
      this.gameState.setState("victory");
      this.eventManager.notify("gameOver", { result: "victory" });
    } else if (!this.player.isAlive) {
      this.gameState.setState("defeat");
      this.eventManager.notify("gameOver", { result: "defeat" });
    }
  }

  start(view) {
    this.view = view;
    this.gameLoop();
  }

  gameLoop() {
    this.update();
    this.view.render();
    requestAnimationFrame(this.gameLoop);
  }
}

class GameState {
  constructor() {
    this.state = "playing";
  }
  setState(state) {
    this.state = state;
  }
}


