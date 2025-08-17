const settings = {
  map: {
    field: {
      width: 1024,
      height: 640,
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
        size: [1],
      },
      type: "wall",
      class: MapGenerator,
    },
  },
  player: {
    health: 150000,
    damage: 20,
    zIndex: 10,
    controls: {
      move: [
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "w",
        "a",
        "s",
        "d",
      ],
      attack: " ",
    },
    class: HumanPlayer,
  },
  bots: {
    health: 100,
    damage: 15,
    amount: 10,
    zIndex: 10,
    rangeVision: 5,
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

const gameController = new GameController(settings);
const gameView = new GameView(gameController, viewClasses, sprites);
gameController.start(gameView);