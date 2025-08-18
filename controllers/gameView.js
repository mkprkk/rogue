class GameView {
  constructor(gameController, spriteImages) {
    this.gameController = gameController;
    this.spriteImages = spriteImages;

    this.canvas = document.createElement("canvas");
    this.canvas.style.position = "absolute";
    this.canvas.style.top = "0";
    this.canvas.style.left = "0";

    this.canvas.width = gameController.field.width;
    this.canvas.height = gameController.field.height;

    document.querySelector(".field").appendChild(this.canvas);
    this.ctx = this.canvas.getContext("2d");

    this.cellSize = gameController.field.getCellSize();

    this.fieldSprites = {
      ground: this.spriteImages.ground,
      wall: this.spriteImages.wall,
    };

    this.initEntityViews();
  }

  initEntityViews() {
    const { player, bots, collectables, field } = this.gameController;

    this.playerView = new PlayerView(
      player,
      this.ctx,
      this.spriteImages.player,
      field.cols,
      this.cellSize
    );

    this.botViews = bots.map(
      (bot) =>
        new PlayerView(
          bot,
          this.ctx,
          this.spriteImages.enemy,
          field.cols,
          this.cellSize
        )
    );

    this.collectableViews = collectables.map(
      (collectable) =>
        new CollectableView(
          collectable,
          this.ctx,
          this.spriteImages[collectable.name],
          field.cols,
          this.cellSize
        )
    );
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  render() {
    this.clearCanvas();

    this.renderField();

    this.collectableViews.forEach((view) => view.render());

    this.botViews.forEach((view) => view.render());

    this.playerView.render();
  }

  renderField() {
    const { cells, cols } = this.gameController.field;

    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i];
      const x = (i % cols) * this.cellSize.width;
      const y = Math.floor(i / cols) * this.cellSize.height;

      const sprite = this.fieldSprites[cell] || this.fieldSprites.ground;
      if (sprite) {
        this.ctx.drawImage(
          sprite,
          x,
          y,
          this.cellSize.width,
          this.cellSize.height
        );
      }
    }
  }
}
