class GameView {
  constructor(gameController, spriteImages) {
    this.gameController = gameController;
    this.spriteImages = spriteImages;

    // Создаем и настраиваем canvas
    this.canvas = document.createElement("canvas");
    this.canvas.style.position = "absolute";
    this.canvas.style.top = "0";
    this.canvas.style.left = "0";

    // Устанавливаем размеры canvas в соответствии с полем
    this.canvas.width = gameController.field.width;
    this.canvas.height = gameController.field.height;

    document.querySelector(".field").appendChild(this.canvas);
    this.ctx = this.canvas.getContext("2d");

    // Получаем размер ячейки
    this.cellSize = gameController.field.getCellSize();

    // Инициализируем спрайты
    this.fieldSprites = {
      ground: this.spriteImages.ground,
      wall: this.spriteImages.wall,
    };

    console.log(gameController.collectables, gameController.bots);

    // Инициализация представлений объектов
    this.initEntityViews();

    console.log("Загруженные спрайты в GameView:", Object.keys(spriteImages));
  }

  initEntityViews() {
    const { player, bots, collectables, field } = this.gameController;


    // Создаем представление игрока
    this.playerView = new PlayerView(
      player,
      this.ctx,
      this.spriteImages.player,
      field.cols,
      this.cellSize
    );

    // Создаем представления ботов
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

    // Создаем представления коллекционных предметов
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
    // Очищаем canvas
    this.clearCanvas();

    // Рендерим поле
    this.renderField();

    // Рендерим коллекционные предметы
    this.collectableViews.forEach((view) => view.render());

    // Рендерим ботов
    this.botViews.forEach((view) => view.render());

    // Рендерим игрока
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
