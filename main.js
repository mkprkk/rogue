const settings = {
  map: {
    field: {
      width: window.innerWidth,
      height: window.innerHeight,
      cols: 40,
      rows: 24,
      type: "ground",
      class: Field,
    },
    obstacles: {
      rooms: {
        range: [5, 10],
        size: [3, 8],
      },
      halls: {
        range: [3, 5],
        size: [1, 2],
      },
      type: "wall",
      class: MapGenerator,
    },
  },
  player: {
    health: 150,
    damage: 20,
    zIndex: 10,
    controls: {
      attack: " ",
    },
    attackCooldown: 0.4,
    speed: 10,
    class: HumanPlayer,
  },
  bots: {
    health: 100,
    damage: 15,
    amount: 10,
    zIndex: 10,
    rangeVision: 5,
    speed: 8,
    attackCooldown: 2,
    class: Bot,
  },
  collectables: {
    healthPotion: {
      name: "healthPotion",
      power: 20,
      amount: 10,
      class: HealthBuff,
    },
    sword: {
      name: "sword",
      power: 20,
      amount: 2,
      class: SwordBuff,
    },
    zIndex: 5,
  },
};

const spriteLoader = new SpriteLoader();
spriteLoader.load(sprites).then(() => {
  const gameController = new GameController(settings);
  const gameView = new GameView(gameController, spriteLoader.images);
  gameController.start(gameView);
});
