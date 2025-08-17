class GameView {
  constructor(gameController, viewClasses, sprites) {
    this.gameController = gameController;
    this.sprites = sprites;

    // Получаем модели из контроллера
    const field = gameController.field;
    const player = gameController.player;
    const bots = gameController.bots;
    const collectables = gameController.collectables;

    // Создаем представления
    this.fieldView = new viewClasses.FieldView(field);
    this.playerView = new viewClasses.PlayerView(
      player,
      this.fieldView.cellElements,
      sprites.player,
      field.cols
    );

    this.botViews = bots.map(
      (bot) =>
        new viewClasses.PlayerView(
          bot,
          this.fieldView.cellElements,
          sprites.enemy,
          field.cols
        )
    );

    this.collectableViews = collectables.map(
      (collectable) =>
        new viewClasses.CollectableView(
          collectable,
          this.fieldView.cellElements,
          sprites[collectable.name],
          field.cols
        )
    );
  }

  render() {
    if (this.playerView.entity.isAlive) {
      this.playerView.updatePosition();
    }

    this.botViews.forEach((botView) => {
      if (botView.entity.isAlive) {
        botView.updatePosition();
      }
    });

    this.collectableViews.forEach((collectableView) => {
      if (collectableView.entity.onField) {
        collectableView.updatePosition();
      }
    });
  }
}