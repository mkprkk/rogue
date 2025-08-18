class GameController {
  constructor(settings) {
    this.settingsPlayer = settings.player;
    this.settingsBot = settings.bots;
    this.settingsMap = settings.map;
    this.settingsCollectables = settings.collectables;

    this.field = new this.settingsMap.field.class(
      this.settingsMap,
      this.settingsMap.obstacles.class
    );

    this.player = new this.settingsPlayer.class(
      this.field,
      this.settingsPlayer
    );
    this.placeOnGround(this.player);
    this.startListeningPlayerMoves();

    this.bots = [];
    this.createBots(this.settingsBot.amount);

    this.collectables = [];
    this.createCollectables(this.settingsCollectables);


    this.gameState = new GameState();
    this.eventManager = new Observer();
    this.eventManager.subscribe("die", () => this.checkWinCondition());

    this.lastUpdateTime = performance.now();
    this.gameLoop = this.gameLoop.bind(this);
  }

  placeOnGround(entity) {
    let attempts = 0;
    const maxAttempts = this.field.cols * this.field.rows * 2;

    while (attempts < maxAttempts) {
      const x = Math.floor(Math.random() * this.field.cols);
      const y = Math.floor(Math.random() * this.field.rows);

      const cellIndex = y * this.field.cols + x;
      if (this.field.cells[cellIndex] !== this.settingsMap.field.type) {
        attempts++;
        continue;
      }

      if (entity.placeEntity(x, y)) {
        return true;
      }

      attempts++;
    }

    for (let y = 0; y < this.field.rows; y++) {
      for (let x = 0; x < this.field.cols; x++) {
        const cellIndex = y * this.field.cols + x;
        if (this.field.cells[cellIndex] === this.settingsMap.field.type) {
          if (entity.placeEntity(x, y)) {
            return true;
          }
        }
      }
    }
  }

  startListeningPlayerMoves() {
    document.addEventListener("keydown", (e) => {
      e.preventDefault();
      this.player.setDirection(e.key);
      this.player.attackKey(e.key);
    });
    document.addEventListener("keyup", () => {
      this.player.setDirection("stop");
    });
  }

  stopListeningPlayerMoves() {
    document.removeEventListener("keydown");
    document.removeEventListener("keyup");
  }

  restartGame() {
    this.player = null;
    this.bots = [];
    this.collectables = [];

    this.gameState.setState("playing");

    this.field = new this.settingsMap.field.class(
      this.settingsMap,
      this.settingsMap.obstacles.class
    );
    this.player = new this.settingsPlayer.class(
      this.field,
      this.settingsPlayer
    );
    this.placeOnGround(this.player);
    this.createBots(this.settingsBot.amount);
    this.createCollectables(this.settingsCollectables);

    this.view.clearCanvas();
    this.view.initEntityViews();
    this.view.render();
  }

  createBots(count) {
    for (let i = 0; i < count; i++) {
      const bot = new this.settingsBot.class(
        this.player,
        this.field,
        this.settingsBot
      );
      this.placeOnGround(bot);
      this.bots.push(bot);
    }
  }

  createCollectables(collectablesSettings) {
    Object.entries(collectablesSettings).forEach(([name, cfg]) => {
      if (name === "zIndex") return;
      for (let i = 0; i < cfg.amount; i++) {
        const collectable = new cfg.class(this.field, cfg);
        this.placeOnGround(collectable);

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

  update(deltaTime) {
    if (!this.player.isAlive) return;
    this.player.update(deltaTime);
    this.bots.forEach((bot) => bot.isAlive && bot.update(deltaTime));

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
    if (this.gameState.state !== "playing") return;

    const allBotsDead = this.bots.every((bot) => !bot.isAlive);
    if (allBotsDead) {
      this.gameState.setState("victory");
      this.eventManager.notify("gameOver", { result: "victory" });

      setTimeout(() => {
        this.restartGame();
      }, 2000);
    } else if (!this.player.isAlive) {
      this.gameState.setState("defeat");
      this.eventManager.notify("gameOver", { result: "defeat" });

      setTimeout(() => {
        this.restartGame();
      }, 2000);
    }
  }

  start(view) {
    this.view = view;
    this.gameLoop();
  }

  gameLoop() {
    const now = performance.now();
    const deltaTime = (now - this.lastUpdateTime) / 1000;
    this.lastUpdateTime = now;

    this.update(deltaTime);
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
